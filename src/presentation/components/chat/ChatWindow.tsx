import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import { useChat } from '../../hooks/useChat'

interface ChatWindowProps {
  onClose: () => void
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, sendMessage, isLoading, isTyping } = useChat()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const messageContent = inputValue
    setInputValue('')
    await sendMessage(messageContent)
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatMessageContent = (content: string): string => {
    // Converter markdown básico para HTML
    let html = content
      // Títulos
      .replace(/^\*\*(.+?)\*\*/gm, '<strong>$1</strong>')
      // Texto em negrito dentro de linhas
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Imagens
      .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded mt-2" />')
      // Links
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" class="underline">$1</a>')
      // Quebras de linha
      .replace(/\n/g, '<br />')
    
    return html
  }

  return (
    <div className="fixed bottom-20 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 animate-fade-in mobile:w-full mobile:bottom-0 mobile:right-0 mobile:rounded-none mobile:h-full mobile:max-h-[calc(100vh-60px)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-semibold text-lg">Suporte</h3>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Olá! Como posso ajudá-lo?</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <div 
                  className={`text-sm whitespace-pre-wrap ${message.sender === 'user' ? 'text-white' : 'text-gray-900'}`}
                  dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                />
                <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}

