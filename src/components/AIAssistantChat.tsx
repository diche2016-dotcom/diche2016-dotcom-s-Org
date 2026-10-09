import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Loader2,
  Lightbulb,
  Copy,
  Check,
  BookOpen,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

export const AIAssistantChat: React.FC = () => {
  const { user, showToast } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      role: 'assistant',
      content: `مرحباً بك يا أستاذ ${user.fullName}! 👋\nأنا «مساعدي»، رفيقك البيداغوجي الذكي في تطبيق "قسمي".\n\nكيف يمكنني دعمك اليوم؟\n- صياغة أهداف ومؤشرات درس جديد\n- اقتراح أنشطة علاجية للأفواج المتعثرة\n- وضعيات مشكلة شائقة لبناء التعلمات\n- استراتيجيات إدارة الصف وتنشيط الفوج`,
      time: 'الآن',
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    'اقترح نشاطاً علاجياً ممتعاً لجدول الضرب في الابتدائي',
    'كيف أصمم وضعية انطلاق محفزة لدرس الفاعل في السنة الرابعة؟',
    'ما هي أفضل استراتيجيات تنشيط العمل بالأفواج في القسم؟',
    'اكتب لي تمرين تقويم تشخيصي للجمع والطرح بالاحتفاظ',
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      time: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          conversationHistory: messages.slice(-6),
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'عذراً، لم أستطع الإجابة.',
        time: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      showToast(err.message || 'فشل الاتصال بالمساعد الذكي', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('تم نسخ الإجابة إلى الحافظة');
  };

  return (
    <div className="flex flex-col h-[78vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Top Banner */}
      <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>مساعدي — الرفيق التربوي الذكي</span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                Gemini 3.8
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              خبير بيداغوجي وديداكتيكي متخصص في منهاج التعليم الابتدائي
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${
              m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                m.role === 'user'
                  ? 'bg-slate-900 dark:bg-slate-700 text-white'
                  : 'bg-emerald-600 text-white shadow-xs'
              }`}
            >
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 relative group ${
                m.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              <div className="whitespace-pre-line leading-relaxed font-sans font-medium">
                {m.content}
              </div>

              <div className="flex items-center justify-between pt-1 text-[10px] opacity-70">
                <span>{m.time}</span>
                {m.role === 'assistant' && (
                  <button
                    onClick={() => handleCopy(m.id, m.content)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-emerald-500 transition-opacity"
                    title="نسخ النص"
                  >
                    {copiedId === m.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>جاري التفكير وصياغة التوجيه البيداغوجي...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-6 py-2 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="whitespace-nowrap px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-500 text-slate-600 dark:text-slate-300 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="اكتب سؤالك أو طلبك البيداغوجي هنا... (مثال: اقترح نشاطاً علاجياً...)"
          className="flex-1 resize-none rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
        />

        <button
          disabled={!input.trim() || isLoading}
          onClick={() => handleSend()}
          className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
};
