'use client'

import { useState } from 'react'

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat icon button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center text-2xl"
        aria-label="Toggle AI Chat"
      >
        💬
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="mt-2 w-80 h-96 bg-white rounded-lg shadow-xl p-4 border border-gray-200 flex flex-col">
          <div className="text-lg font-semibold mb-2 text-blue-700">ChipEstate AI</div>
          <div className="flex-1 overflow-y-auto text-sm text-gray-700">
            <p>Hello! I'm your ChipEstate assistant. How can I help?</p>
          </div>
          <input
            type="text"
            placeholder="Type a message..."
            className="mt-2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  )
}
