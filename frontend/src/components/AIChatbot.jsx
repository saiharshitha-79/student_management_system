import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { MessageSquare, X, Send, Bot } from 'lucide-react'

export default function AIChatbot({ token }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your AI Academic Advisor. How can I assist you today?' }
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = input
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setInput('')

    try {
      const res = await axios.post('http://localhost:8000/ai/advisor-chat', 
        { message: userMsg },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessages(prev => [...prev, { role: 'ai', text: res.data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting to the AI core." }])
    }
  }

  if (!isOpen) {
    return (
      <div className="chat-widget">
        <div className="chat-toggle" onClick={() => setIsOpen(true)}>
          <Bot size={28} />
        </div>
      </div>
    )
  }

  return (
    <div className="chat-widget">
      <div className="glass-panel chat-window">
        <div className="chat-header" style={{justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <Bot size={20} color="var(--primary)" />
            AI Advisor
          </div>
          <X size={20} style={{cursor: 'pointer', color: 'var(--text-muted)'}} onClick={() => setIsOpen(false)} />
        </div>
        
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role === 'ai' ? 'msg-ai' : 'msg-user'}`}>
              {m.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <form className="chat-input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Ask me anything..." 
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{padding: '0.5rem 1rem'}}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
