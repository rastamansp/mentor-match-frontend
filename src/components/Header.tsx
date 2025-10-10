import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Menu, X, User, LogOut, Calendar, Ticket } from 'lucide-react'

const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Gwan Shop</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/events" className="text-gray-600 hover:text-gray-900 transition-colors">
              Eventos
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/my-tickets" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors">
                  <Ticket className="h-4 w-4" />
                  <span>Meus Ingressos</span>
                </Link>
                
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Admin
                  </Link>
                )}
                
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-600">{user.name}</span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Entrar
                </Link>
                <Link to="/register" className="btn-primary">
                  Cadastrar
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link to="/events" className="text-gray-600 hover:text-gray-900 transition-colors">
                Eventos
              </Link>
              
              {user ? (
                <>
                  <Link to="/my-tickets" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <Ticket className="h-4 w-4" />
                    <span>Meus Ingressos</span>
                  </Link>
                  
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" className="text-gray-600 hover:text-gray-900 transition-colors">
                      Admin
                    </Link>
                  )}
                  
                  <div className="flex items-center space-x-2 text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{user.name}</span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Entrar
                  </Link>
                  <Link to="/register" className="btn-primary w-fit">
                    Cadastrar
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
