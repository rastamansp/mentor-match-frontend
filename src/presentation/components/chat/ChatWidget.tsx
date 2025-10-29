import React, { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { ChatWindow } from './ChatWindow'

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-40"
        aria-label="Abrir chat de suporte"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && <ChatWindow onClose={toggleChat} />}
    </>
  )
}

