import React, { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import { ChatWidget } from '../presentation/components/chat/ChatWidget'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}

export default Layout
