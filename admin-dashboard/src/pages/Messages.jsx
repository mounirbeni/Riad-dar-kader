import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { messages as initialMessages } from '../data/mockData'

export default function Messages() {
  const [messages, setMessages] = useState(initialMessages)
  const [active, setActive] = useState(messages[0])
  const [input, setInput] = useState('')

  function send() {
    if (!input.trim()) return
    const msg = { from: 'admin', text: input.trim(), time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
    setMessages(prev => prev.map(m => m.id === active.id ? { ...m, thread: [...m.thread, msg], lastMsg: msg.text, unread: 0 } : m))
    setActive(prev => ({ ...prev, thread: [...prev.thread, msg], lastMsg: msg.text }))
    setInput('')
  }

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Conversation list */}
      <div className="w-80 flex-shrink-0 border-r border-sand-dark bg-white flex flex-col">
        <div className="p-4 border-b border-sand-dark">
          <div className="relative">
            <input type="text" placeholder="Rechercher..." className="w-full pl-8 pr-4 py-2 text-sm bg-sand rounded-xl border border-sand-dark focus:outline-none focus:border-terracotta transition" />
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {messages.map(m => (
            <button key={m.id} onClick={() => { setActive(m); setMessages(prev => prev.map(msg => msg.id === m.id ? { ...msg, unread: 0 } : msg)) }}
              className={`w-full text-left px-4 py-4 border-b border-sand-dark/50 hover:bg-sand/50 transition-colors ${active?.id === m.id ? 'bg-terracotta/5 border-l-2 border-l-terracotta' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-terracotta text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {m.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-ink truncate">{m.guest}</p>
                    <p className="text-[10px] text-muted flex-shrink-0 ml-2">{m.time}</p>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-muted truncate">{m.lastMsg}</p>
                    {m.unread > 0 && (
                      <span className="flex-shrink-0 ml-2 h-5 w-5 rounded-full bg-terracotta text-white text-[10px] font-bold flex items-center justify-center">
                        {m.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Thread */}
      {active ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Thread header */}
          <div className="px-6 py-4 bg-white border-b border-sand-dark flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-terracotta text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
              {active.initials}
            </div>
            <div>
              <p className="font-semibold text-ink">{active.guest}</p>
              <p className="text-xs text-muted">Via WhatsApp</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <a href={`https://wa.me/212600000000`} target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#25D366] text-white text-xs font-medium rounded-lg hover:bg-[#1EA855] transition flex items-center gap-1.5">
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24z"/></svg>
                Ouvrir WhatsApp
              </a>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence initial={false}>
              {active.thread.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs xl:max-w-sm rounded-2xl px-4 py-2.5 text-sm ${
                    msg.from === 'admin'
                      ? 'bg-terracotta text-white rounded-br-md'
                      : 'bg-white border border-sand-dark text-ink rounded-bl-md shadow-sm'
                  }`}>
                    <p className="leading-relaxed">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.from === 'admin' ? 'text-white/60 text-right' : 'text-muted'}`}>{msg.time}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Input */}
          <div className="px-6 py-4 bg-white border-t border-sand-dark">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Écrire un message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                className="flex-1 px-4 py-2.5 text-sm bg-sand rounded-xl border border-sand-dark focus:outline-none focus:border-terracotta transition"
              />
              <button onClick={send} disabled={!input.trim()}
                className="h-10 w-10 rounded-xl bg-terracotta text-white flex items-center justify-center hover:bg-terracotta-dark transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted">
          <p>Sélectionnez une conversation</p>
        </div>
      )}
    </div>
  )
}
