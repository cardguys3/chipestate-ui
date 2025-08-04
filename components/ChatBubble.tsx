'use client'

import { useState } from 'react'

export default function ChatBubble() {
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')

  const sendMessage = async () => {
    if (!input.trim()) return

    const newHistory = [...chatHistory, { role: 'user', content: input }]
    setChatHistory(newHistory)
    setInput('')

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a helpful real estate AI assistant.' },
          ...newHistory,
        ],
      }),
    })

    const data = await res.json()
    setChatHistory([...newHistory, { role: 'assistant', content: data.reply }])
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-full bg-white text-black rounded-xl shadow-lg p-4 space-y-4">
      <div className="h-64 overflow-y-auto space-y-2">
        {chatHistory.map((m, i) => (
          <div key={i} className={`text-sm p-2 rounded ${m.role === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-200 text-left'}`}>
            {m.content}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 border rounded px-2 py-1"
          placeholder="Ask a question..."
        />
        <button onClick={sendMessage} className="bg-emerald-500 text-white px-4 py-1 rounded">
          Send
        </button>
      </div>
    </div>
  )
}
