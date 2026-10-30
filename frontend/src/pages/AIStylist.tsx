import { useState, useEffect, useRef } from 'react';
import { chatApi } from '../services/api';
import { ChatMessage, ChatConversation } from '../types';
import { Send, Mic, MicOff, MessageSquare, Plus } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function AIStylist() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | undefined>();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    chatApi.getConversations()
      .then(r => setConversations(r.conversations || []))
      .catch(() => {})
      .finally(() => setLoadingConvs(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadConversation = async (convId: string) => {
    setCurrentConvId(convId);
    try {
      const res = await chatApi.getMessages(convId);
      setMessages(res.messages || []);
    } catch {
      toast.error('Failed to load conversation');
    }
  };

  const startNewConversation = () => {
    setCurrentConvId(undefined);
    setMessages([]);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setLoading(true);

    // Optimistically add user message
    const tempMsg: ChatMessage = {
      id: 'temp-' + Date.now(),
      conversation_id: currentConvId || '',
      user_id: '',
      role: 'user',
      content: userMsg,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await chatApi.sendMessage(userMsg, currentConvId);
      setCurrentConvId(res.conversation_id);

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        conversation_id: res.conversation_id,
        user_id: '',
        role: 'model',
        content: res.reply,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev.filter(m => m.id !== tempMsg.id), 
        { ...tempMsg, id: 'user-' + Date.now(), conversation_id: res.conversation_id }, aiMsg]);

      // Update conversations list
      if (!currentConvId) {
        setConversations(prev => [res.conversation, ...prev]);
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      toast.error(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Voice input
  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice input not supported in your browser');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => { setIsListening(false); toast.error('Voice input error'); };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const suggestions = [
    'What outfit should I wear to a job interview?',
    'Suggest festive Indian wear for Diwali',
    'How to style a saree for a modern look?',
    'Casual outfit ideas for college',
  ];

  return (
    <div className="h-[calc(100vh-120px)] flex gap-4 animate-fade-in">
      {/* Conversations sidebar */}
      <div className="hidden md:flex flex-col w-64 card p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 text-sm">Conversations</h2>
          <button onClick={startNewConversation} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" aria-label="New conversation">
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {loadingConvs ? <LoadingSpinner size="sm" /> : (
          <div className="flex-1 overflow-y-auto space-y-1">
            <button onClick={startNewConversation}
              className={clsx('w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                !currentConvId ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50')}>
              + New Chat
            </button>
            {conversations.map(conv => (
              <button key={conv.id} onClick={() => loadConversation(conv.id)}
                className={clsx('w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate',
                  currentConvId === conv.id ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50')}>
                {conv.title || 'Conversation'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col card overflow-hidden p-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">StyleGuru AI</p>
            <p className="text-xs text-green-500">● Online — Your personal fashion assistant</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-primary-600" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Hello! I'm StyleGuru</h3>
              <p className="text-gray-400 text-sm mb-6">Your AI fashion assistant. Ask me anything about style, outfits, or fashion!</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.map(s => (
                  <button key={s} onClick={() => { setInput(s); }}
                    className="text-left text-xs p-3 bg-gray-50 rounded-xl text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                    "{s}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'model' && (
                <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
              )}
              <div className={clsx(
                'max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              )}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center mr-2">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-4 border-t border-gray-100 pt-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                className="input-field resize-none min-h-[44px] max-h-32 pr-12"
                placeholder="Ask StyleGuru about fashion, outfits, styling tips..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                aria-label="Chat message input"
              />
            </div>
            <button onClick={toggleVoice}
              className={clsx('p-2.5 rounded-xl transition-colors flex-shrink-0',
                isListening ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
              aria-label={isListening ? 'Stop listening' : 'Start voice input'}>
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button onClick={handleSend} disabled={!input.trim() || loading}
              className="btn-primary p-2.5 flex-shrink-0"
              aria-label="Send message">
              <Send className="w-5 h-5" />
            </button>
          </div>
          {isListening && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Listening... speak now
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

