'use client';
import React, { useState, useRef, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useLanguage } from '@/lib/i18n/context';
import { AssessmentResult, EligibilityResult } from '@/lib/rules-engine/types';
import {
  Send, Mic, MicOff, Paperclip, Loader2, Bot, User,
  Banknote, GraduationCap, HeartPulse, ShieldPlus, Package,
  CheckCircle2, AlertCircle, XCircle, HelpCircle,
  ChevronDown, ChevronUp, ExternalLink, MessageSquare,
  Phone, Globe, MapPin, FileText, Volume2, Share2, Printer
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  results?: AssessmentResult;
}

const PROGRAM_ICONS: Record<string, React.ReactNode> = {
  kafaalat: <Banknote className="w-5 h-5" />,
  taleemi_wazaif: <GraduationCap className="w-5 h-5" />,
  nashonuma: <HeartPulse className="w-5 h-5" />,
  sehat_sahulat: <ShieldPlus className="w-5 h-5" />,
  ramzan_relief: <Package className="w-5 h-5" />,
};

const STATUS_CONFIG = {
  LIKELY_ELIGIBLE: { icon: <CheckCircle2 className="w-5 h-5" />, label: 'Likely Eligible', labelUr: 'غالباً اہل', class: 'status-eligible', color: '#34D399' },
  MAY_BE_ELIGIBLE: { icon: <AlertCircle className="w-5 h-5" />, label: 'May Be Eligible', labelUr: 'اہل ہو سکتے ہیں', class: 'status-maybe', color: '#FBBF24' },
  LIKELY_NOT_ELIGIBLE: { icon: <XCircle className="w-5 h-5" />, label: 'Likely Not Eligible', labelUr: 'غالباً نا اہل', class: 'status-unlikely', color: '#FB7185' },
  INSUFFICIENT_DATA: { icon: <HelpCircle className="w-5 h-5" />, label: 'More Info Needed', labelUr: 'مزید معلومات درکار', class: 'status-maybe', color: '#94A3B8' },
};

function ResultCard({ result, lang }: { result: EligibilityResult; lang: string }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[result.status];
  const isEn = lang === 'en';

  return (
    <div className="glass rounded-xl overflow-hidden card-hover border border-border-subtle">
      <div className="p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${result.program.color}15`, color: result.program.color }}>
            {PROGRAM_ICONS[result.programId]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-bold text-cream text-sm">{isEn ? result.program.name.en : result.program.name.ur}</h4>
              <span className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap ${status.class}`}>
                {isEn ? status.label : status.labelUr}
              </span>
            </div>
            <p className="text-xs text-gold-400 mt-1">{isEn ? result.program.benefit.en : result.program.benefit.ur}</p>
          </div>
          <button className="text-sage-500 shrink-0">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border-subtle pt-4 animate-fade-in-up">
          {/* Explanation */}
          <div>
            <h5 className="text-xs font-semibold text-sage-400 mb-2 uppercase tracking-wider">Why</h5>
            <p className="text-sm text-sage-300 leading-relaxed">{isEn ? result.explanation.en : result.explanation.ur}</p>
          </div>

          {/* Province Note */}
          {result.provinceNote && (
            <div className="p-3 rounded-lg bg-gold-500/5 border border-gold-500/20">
              <p className="text-xs text-gold-400">⚠️ {isEn ? result.provinceNote.en : result.provinceNote.ur}</p>
            </div>
          )}

          {/* Required Documents */}
          <div>
            <h5 className="text-xs font-semibold text-sage-400 mb-2 uppercase tracking-wider flex items-center gap-1"><FileText className="w-3 h-3" /> Documents Needed</h5>
            <ul className="space-y-1">
              {(isEn ? result.program.requiredDocuments.en : result.program.requiredDocuments.ur).map((doc, i) => (
                <li key={i} className="text-xs text-sage-300 flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span> {doc}
                </li>
              ))}
            </ul>
          </div>

          {/* Registration Channels */}
          <div>
            <h5 className="text-xs font-semibold text-sage-400 mb-2 uppercase tracking-wider">How to Register</h5>
            <div className="space-y-2">
              {result.program.registrationChannels.map((ch, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  {ch.type === 'sms' && <MessageSquare className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />}
                  {ch.type === 'web_portal' && <Globe className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />}
                  {ch.type === 'helpline' && <Phone className="w-3.5 h-3.5 text-gold-400 mt-0.5 shrink-0" />}
                  {ch.type === 'in_person' && <MapPin className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />}
                  <div>
                    <span className="text-sage-300">{isEn ? ch.details.en : ch.details.ur}</span>
                    {ch.smsCode && <span className="ml-2 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold">{ch.smsCode}</span>}
                    {ch.url && <a href={ch.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-400 hover:underline inline-flex items-center gap-1">{ch.url.replace('https://', '')} <ExternalLink className="w-3 h-3" /></a>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-program alerts */}
          {result.unlocks && result.unlocks.length > 0 && (
            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-xs text-emerald-400">🔗 Qualifying for this program may also unlock: {result.unlocks.join(', ')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function NavigatorPage() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: t('chat.welcome'),
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [latestResults, setLatestResults] = useState<AssessmentResult | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = [...messages.filter(m => m.id !== 'welcome'), userMsg].map(m => ({
        role: m.role, content: m.content
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory, language }),
      });

      const data = await res.json();
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || 'I could not process that. Please try again.',
        timestamp: new Date(),
        results: data.eligibilityResults || undefined,
      };
      setMessages(prev => [...prev, assistantMsg]);

      if (data.eligibilityResults) {
        setLatestResults(data.eligibilityResults);
        setShowResults(true);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, there was an error. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser. Please use Chrome.');
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    const langMap: Record<string, string> = { en: 'en-US', ur: 'ur-PK', sd: 'sd-PK', ps: 'ps-AF', pn: 'pa-PK', bl: 'bal' };
    recognition.lang = langMap[language] || 'en-US';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + ' ' + transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // For now, notify the user about the upload
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: `📎 Uploaded: ${file.name}`,
      timestamp: new Date(),
    }, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `I see you've uploaded "${file.name}". Document analysis with AI vision is available when configured with a Gemini API key. For now, please describe the information from your document (CNIC number, province, household details) and I'll help you check eligibility.`,
      timestamp: new Date(),
    }]);
  };

  return (
    <AppShell>
      <div className="flex h-full">
        {/* Chat Area */}
        <div className={`flex-1 flex flex-col min-w-0 ${showResults && latestResults ? 'lg:w-1/2' : 'w-full'}`}>
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-border-subtle bg-surface-secondary/50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center">
                <Bot className="w-5 h-5 text-emerald-950" />
              </div>
              <div>
                <h2 className="font-bold text-cream">{t('app.name')} AI Navigator</h2>
                <p className="text-xs text-sage-500">Powered by Hybrid AI (Rules + LLM)</p>
              </div>
            </div>
            {latestResults && (
              <button
                onClick={() => setShowResults(!showResults)}
                className="text-xs px-3 py-1.5 rounded-lg glass text-gold-400 hover:bg-emerald-800/40 transition-colors lg:hidden"
              >
                {showResults ? 'Hide' : 'Show'} Results ({latestResults.likelyEligibleCount + latestResults.mayBeEligibleCount})
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-emerald-950" />
                  </div>
                )}
                <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-emerald-700/40 text-cream rounded-br-md'
                    : 'glass text-sage-300 rounded-bl-md'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <p className="text-[10px] text-sage-600 mt-2">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-emerald-700/40 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-sage-400" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 animate-fade-in-up">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-emerald-950" />
                </div>
                <div className="glass rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-gold-400 animate-spin" />
                  <span className="text-sm text-sage-400">{t('chat.analyzing')}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="px-4 md:px-6 pb-4 pt-2 border-t border-border-subtle bg-surface-primary shrink-0">
            <div className="flex items-end gap-2 glass rounded-2xl p-2">
              <input
                ref={fileInputRef as any}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl hover:bg-emerald-800/40 text-sage-500 hover:text-sage-300 transition-colors shrink-0"
                title="Upload Document"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={t('chat.placeholder')}
                rows={1}
                className="flex-1 bg-transparent text-cream placeholder-sage-600 text-sm resize-none outline-none py-2.5 max-h-32"
                style={{ minHeight: '40px' }}
              />
              <button
                onClick={toggleVoice}
                className={`p-2.5 rounded-xl transition-colors shrink-0 ${
                  isListening ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'hover:bg-emerald-800/40 text-sage-500 hover:text-sage-300'
                }`}
                title="Voice Input"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-emerald-950 disabled:opacity-40 hover:from-gold-500 hover:to-gold-400 transition-all shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            {isListening && (
              <div className="flex items-center gap-2 mt-2 px-2">
                <div className="flex items-center gap-1 h-6">
                  {Array.from({ length: 5 }).map((_, i) => (<div key={i} className="voice-bar" />))}
                </div>
                <span className="text-xs text-rose-400">{t('voice.listening')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Results Panel */}
        {showResults && latestResults && (
          <div className="hidden lg:flex w-96 xl:w-[28rem] flex-col border-l border-border-subtle bg-surface-secondary/30 shrink-0">
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
              <h3 className="font-bold text-cream">{t('results.title')}</h3>
              <div className="flex gap-2">
                <button className="p-1.5 rounded-lg hover:bg-emerald-800/40 text-sage-500" title="Share"><Share2 className="w-4 h-4" /></button>
                <button className="p-1.5 rounded-lg hover:bg-emerald-800/40 text-sage-500" title="Print"><Printer className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Summary */}
              <div className="glass-gold rounded-xl p-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-2xl font-bold text-emerald-400">{latestResults.likelyEligibleCount}</div>
                    <div className="text-[10px] text-sage-500">Likely</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">{latestResults.mayBeEligibleCount}</div>
                    <div className="text-[10px] text-sage-500">Maybe</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-sage-500">{latestResults.totalProgramsChecked}</div>
                    <div className="text-[10px] text-sage-500">Checked</div>
                  </div>
                </div>
              </div>

              {/* Cross-program alerts */}
              {latestResults.crossProgramAlerts.en.length > 0 && (
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <h4 className="text-xs font-semibold text-emerald-400 mb-2">🔗 Cross-Program Alerts</h4>
                  {latestResults.crossProgramAlerts.en.map((alert, i) => (
                    <p key={i} className="text-xs text-sage-300 mb-1">{alert}</p>
                  ))}
                </div>
              )}

              {/* Program cards */}
              {latestResults.results.map(result => (
                <ResultCard key={result.programId} result={result} lang={language} />
              ))}

              {/* Disclaimer */}
              <div className="p-3 rounded-xl bg-gold-500/5 border border-gold-500/20">
                <p className="text-[11px] text-gold-400/80 leading-relaxed">
                  ⚠️ {latestResults.disclaimer.en}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
