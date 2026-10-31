import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { chatMessageSchema } from '../schemas';
import { createUserClient } from '../config/supabase';
import { genAI, modelName, SYSTEM_INSTRUCTION } from '../config/gemini';
import { v4 as uuidv4 } from 'uuid';

export const aiRouter = Router();

const fallbackConversations = new Map<string, any[]>();
const fallbackMessages = new Map<string, any[]>();

// POST /api/v1/ai/chat
aiRouter.post('/chat', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parsed = chatMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const { message, conversation_id } = parsed.data;
    const client = createUserClient(req.accessToken!);

    let convId = conversation_id || uuidv4();
    let conversationData: any = {
      id: convId,
      user_id: req.userId!,
      title: message.substring(0, 50),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Try Supabase conversation
    try {
      if (!conversation_id) {
        const { data } = await client
          .from('chat_conversations')
          .insert({ user_id: req.userId!, title: message.substring(0, 50) })
          .select()
          .single();
        if (data) {
          conversationData = data;
          convId = data.id;
        }
      }
    } catch {}

    // Track in fallback
    const userConvs = fallbackConversations.get(req.userId!) || [];
    if (!userConvs.some(c => c.id === convId)) {
      userConvs.unshift(conversationData);
      fallbackConversations.set(req.userId!, userConvs);
    }

    // Get previous messages
    const prevMsgs = fallbackMessages.get(convId) || [];

    // Build chat history for Gemini
    const chatHistory = prevMsgs.map(msg => ({
      role: msg.role as 'user' | 'model',
      parts: [{ text: msg.content }],
    }));

    let aiReply = "Hello! As your StyleGuru fashion assistant, I recommend choosing outfits that highlight your comfort and natural confidence. What occasion or style are you dressing for today?";

    try {
      const contents = chatHistory.length === 0
        ? [{ role: 'user' as const, parts: [{ text: `${SYSTEM_INSTRUCTION}\n\nUser: ${message}` }] }]
        : [...chatHistory, { role: 'user' as const, parts: [{ text: message }] }];

      const result = await genAI.models.generateContent({
        model: modelName,
        contents,
      });

      if (result.text) {
        aiReply = result.text;
      }
    } catch (err: any) {
      console.warn('Gemini chat fallback:', err.message);
    }

    const userMsgObj = {
      id: uuidv4(),
      conversation_id: convId,
      user_id: req.userId!,
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    };

    const aiMsgObj = {
      id: uuidv4(),
      conversation_id: convId,
      user_id: req.userId!,
      role: 'model',
      content: aiReply,
      created_at: new Date().toISOString(),
    };

    // Store in fallback
    prevMsgs.push(userMsgObj, aiMsgObj);
    fallbackMessages.set(convId, prevMsgs);

    // Try save to Supabase
    try {
      await client.from('chat_messages').insert([userMsgObj, aiMsgObj]);
      await client.from('chat_conversations').update({ updated_at: new Date().toISOString() }).eq('id', convId);
    } catch {}

    res.json({ reply: aiReply, conversation_id: convId, conversation: conversationData });
  } catch (err: any) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'AI assistant is temporarily unavailable. Please try again.' });
  }
});

// GET /api/v1/ai/conversations
aiRouter.get('/conversations', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const client = createUserClient(req.accessToken!);
    const { data, error } = await client
      .from('chat_conversations')
      .select('*')
      .eq('user_id', req.userId!)
      .order('updated_at', { ascending: false });

    if (error) {
      const list = fallbackConversations.get(req.userId!) || [];
      res.json({ conversations: list });
      return;
    }
    res.json({ conversations: data });
  } catch (err) {
    const list = fallbackConversations.get(req.userId!) || [];
    res.json({ conversations: list });
  }
});

// GET /api/v1/ai/conversations/:id/messages
aiRouter.get('/conversations/:id/messages', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const client = createUserClient(req.accessToken!);
    const { data, error } = await client
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', req.params.id)
      .order('created_at', { ascending: true });

    if (error) {
      const msgs = fallbackMessages.get(req.params.id) || [];
      res.json({ messages: msgs });
      return;
    }
    res.json({ messages: data });
  } catch (err) {
    const msgs = fallbackMessages.get(req.params.id) || [];
    res.json({ messages: msgs });
  }
});
