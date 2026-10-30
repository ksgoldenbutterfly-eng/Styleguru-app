import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { chatMessageSchema } from '../schemas';
import { createUserClient } from '../config/supabase';
import { genAI, modelName, SYSTEM_INSTRUCTION } from '../config/gemini';
import { v4 as uuidv4 } from 'uuid';

export const aiRouter = Router();

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

    // Get or create conversation
    let convId = conversation_id;
    let conversationData;

    if (!convId) {
      const { data, error } = await client
        .from('chat_conversations')
        .insert({ user_id: req.userId!, title: message.substring(0, 50) })
        .select()
        .single();
      if (error) throw error;
      conversationData = data;
      convId = data.id;
    } else {
      const { data } = await client
        .from('chat_conversations')
        .select('*')
        .eq('id', convId)
        .eq('user_id', req.userId!)
        .single();
      conversationData = data;
    }

    // Fetch conversation history
    const { data: history } = await client
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
      .limit(20);

    // Fetch user profile for context
    const { data: profile } = await client.from('profiles').select('*').eq('id', req.userId!).single();

    // Build chat history for Gemini
    const chatHistory = (history || []).map(msg => ({
      role: msg.role as 'user' | 'model',
      parts: [{ text: msg.content }],
    }));

    // Add system context to first message if no history
    const systemContext = `${SYSTEM_INSTRUCTION}

User Context:
- Name: ${profile?.full_name || 'User'}
- Preferred Style: ${profile?.preferred_style || 'Not specified'}
- Favorite Colors: ${profile?.favorite_colors?.join(', ') || 'Not specified'}

Please respond in a conversational, helpful manner.`;

    const contents = chatHistory.length === 0
      ? [{ role: 'user' as const, parts: [{ text: `${systemContext}\n\nUser: ${message}` }] }]
      : [...chatHistory, { role: 'user' as const, parts: [{ text: message }] }];

    const result = await genAI.models.generateContent({
      model: modelName,
      contents,
    });

    const aiReply = result.text || 'I apologize, I could not generate a response. Please try again.';

    // Save user message
    await client.from('chat_messages').insert({
      conversation_id: convId,
      user_id: req.userId!,
      role: 'user',
      content: message,
    });

    // Save AI response
    await client.from('chat_messages').insert({
      conversation_id: convId,
      user_id: req.userId!,
      role: 'model',
      content: aiReply,
    });

    // Update conversation timestamp
    await client.from('chat_conversations').update({ updated_at: new Date().toISOString() }).eq('id', convId);

    res.json({ reply: aiReply, conversation_id: convId, conversation: conversationData });
  } catch (err) {
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

    if (error) throw error;
    res.json({ conversations: data });
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
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

    if (error) throw error;
    res.json({ messages: data });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

