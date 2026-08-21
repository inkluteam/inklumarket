import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Bot, LifeBuoy } from 'lucide-react'
import { useDataStore } from '../context/DataStore'
import { useAuth } from '../context/AuthContext'
import { reply as routeReply, INTENTS } from '../utils/chatRouting'

const OPEN_EVENT = 'im:open-chat'

export function openSupportChat() {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT))
}

const GREETING = {
  role: 'bot',
  body: "Hi! I'm IncluBot — your inclusive shopping assistant. Ask me anything, or pick a topic below. You can also talk to a human anytime.",
  sentAt: new Date().toISOString()
}

export default function SupportChatbot() {
  const { user } = useAuth()
  const { createChatSession, addChatMessage, escalateChatToTicket } = useDataStore()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([GREETING])
  const [sessionId, setSessionId] = useState(null)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [escalated, setEscalated] = useState(null)
  const logRef = useRef(null)

  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener(OPEN_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_EVENT, onOpen)
  }, [])

  useEffect(() => {
    if (open && logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [messages, typing, open])

  const send = useCallback((text) => {
    const body = String(text || '').trim()
    if (!body) return
    let sid = sessionId
    if (!sid) {
      const session = createChatSession(user?.id || null, 'guest-' + Math.random().toString(36).slice(2, 8))
      sid = session.id
      setSessionId(sid)
    }
    addChatMessage(sid, 'user', body)
    setMessages(m => [...m, { role: 'user', body, sentAt: new Date().toISOString() }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      const r = routeReply(body)
      addChatMessage(sid, 'bot', r.body)
      setMessages(m => [...m, { role: 'bot', body: r.body, followUp: r.followUp, sentAt: new Date().toISOString() }])
      setTyping(false)
    }, 600 + Math.random() * 500)
  }, [sessionId, user, createChatSession, addChatMessage])

  function escalate() {
    const firstUserMsg = messages.find(m => m.role === 'user')?.body || 'General support request'
    const subject = 'Chat escalation: ' + firstUserMsg.slice(0, 60)
    const ticket = escalateChatToTicket(sessionId || createChatSession(user?.id || null, 'guest').id, user?.id || null, subject)
    setEscalated(ticket.id)
    setMessages(m => [...m, { role: 'bot', body: `Done! Ticket ${ticket.id} was created and our support team has been notified. You can follow it under Account → Support Tickets (updates arrive in Notifications).`, sentAt: new Date().toISOString() }])
  }

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close support chat' : 'Open support chat'}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full shadow-xl grid place-items-center text-white transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
        style={{ background: 'linear-gradient(135deg,#0047AB,#E6397E)' }}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {!open && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F2B705] border-2 border-white" aria-hidden="true" />}
      </button>

      {open && (
        <div className="fixed bottom-22 right-5 z-50 w-[min(380px,calc(100vw-2.5rem))] h-[min(520px,70vh)] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          role="dialog" aria-label="IncluBot support chat">
          <header className="px-4 py-3 text-white flex items-center gap-2.5 shrink-0" style={{ background: 'linear-gradient(135deg,#0047AB,#E6397E)' }}>
            <span className="w-9 h-9 rounded-full bg-white/20 grid place-items-center"><Bot size={19} /></span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">IncluBot · Support</p>
              <p className="text-[.7rem] opacity-80">Smart routing · humans on standby</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Minimize chat" className="p-1 rounded hover:bg-white/20"><X size={16} /></button>
          </header>

          <div ref={logRef} role="log" aria-live="polite" className="flex-1 overflow-y-auto px-3.5 py-3 space-y-2.5 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className="max-w-[85%] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap"
                  style={{
                    borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: m.role === 'user' ? '#0047AB' : '#fff',
                    color: m.role === 'user' ? '#fff' : '#111827',
                    border: m.role === 'user' ? 'none' : '1px solid #e5e7eb'
                  }}
                >
                  {m.body}
                  {m.followUp && <p className="text-[.7rem] mt-1.5 opacity-60">{m.followUp}</p>}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start"><div className="bg-white border border-gray-200 px-3 py-2 rounded-[14px_14px_14px_4px] text-sm text-gray-400">IncluBot is typing…</div></div>
            )}
            {escalated && (
              <p className="text-center text-[.72rem] text-green-700 font-semibold pt-1">✓ Ticket {escalated} active — track in Support Tickets</p>
            )}
          </div>

          {!escalated && (
            <div className="px-2.5 pt-2 flex gap-1.5 flex-wrap bg-gray-50 border-t border-gray-100" role="group" aria-label="Quick topics">
              {INTENTS.slice(0, 4).map(t => (
                <button key={t.id} onClick={() => send(t.keywords[0])} className="text-[.7rem] font-semibold px-2.5 py-1 rounded-full border border-blue-100 text-blue-800 hover:bg-blue-50">
                  {t.label.split(' ')[0]}
                </button>
              ))}
              <button onClick={() => send('I want to talk to a human')} className="text-[.7rem] font-semibold px-2.5 py-1 rounded-full border border-rose-200 text-rose-700 hover:bg-rose-50 inline-flex items-center gap-1">
                <LifeBuoy size={11} /> Human
              </button>
            </div>
          )}

          <form onSubmit={e => { e.preventDefault(); send(input) }} className="p-2.5 bg-white flex gap-2 items-center border-t border-gray-100">
            <label htmlFor="inclubot-input" className="sr-only">Type your message</label>
            <input
              id="inclubot-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={escalated ? 'Ticket created — type to start a new question' : 'Ask about orders, payments…'}
              className="flex-1 border border-gray-200 rounded-full px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              autoComplete="off"
            />
            <button type="submit" disabled={!input.trim()} aria-label="Send message"
              className="w-10 h-10 rounded-full grid place-items-center text-white disabled:opacity-40 shrink-0"
              style={{ background: '#0047AB' }}>
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
