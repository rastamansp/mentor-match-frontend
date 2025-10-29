import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { usePurchaseTicket } from '../hooks/usePurchaseTicket'
import { ParticipantData } from '../../application/dto/ParticipantData'
import { ParticipantInfo } from '../../domain/repositories/ITicketRepository'

interface CheckoutState {
  eventId: string
  categoryId: string
  categoryName: string
  eventTitle: string
  categoryPrice: number
  quantity: number
}

export const CheckoutPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { purchaseTicket, loading } = usePurchaseTicket()

  const state = location.state as CheckoutState

  // Verificar se state existe
  useEffect(() => {
    if (!state || !state.eventId) {
      navigate('/events')
    }
  }, [state, navigate])

  const [participants, setParticipants] = useState<ParticipantData[]>([])
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD'>('PIX')
  const [installments, setInstallments] = useState<number>(1)
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({})

  // Inicializar participantes
  useEffect(() => {
    if (state?.quantity) {
      const initialParticipants: ParticipantData[] = Array.from({ length: state.quantity }, () => ({
        firstName: '',
        lastName: '',
        email: '',
        document: ''
      }))
      setParticipants(initialParticipants)
    }
  }, [state?.quantity])

  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return numPrice.toFixed(2).replace('.', ',')
  }

  const calculateTotal = (): string => {
    const price = typeof state?.categoryPrice === 'string' ? parseFloat(state.categoryPrice) : state?.categoryPrice || 0
    return formatPrice(price * (state?.quantity || 0))
  }

  const applyCPFMask = (value: string): string => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 11) {
      return cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    return value
  }

  const handleParticipantChange = (index: number, field: keyof ParticipantData, value: string) => {
    const updated = [...participants]
    if (field === 'document') {
      updated[index][field] = applyCPFMask(value)
    } else {
      updated[index][field] = value
    }
    setParticipants(updated)
    // Limpar erro do campo
    if (errors[index]?.[field]) {
      const newErrors = { ...errors }
      delete newErrors[index]?.[field]
      setErrors(newErrors)
    }
  }

  const useMyData = (index: number) => {
    if (!user) return

    const parts = (user.name || '').split(' ')
    const firstName = parts[0] || ''
    const lastName = parts.slice(1).join(' ') || ''

    const updated = [...participants]
    updated[index] = {
      firstName,
      lastName,
      email: user.email || '',
      document: applyCPFMask(user.phone?.replace(/\D/g, '') || '')
    }
    setParticipants(updated)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<number, Record<string, string>> = {}
    let isValid = true

    participants.forEach((participant, index) => {
      if (!participant.firstName.trim()) {
        newErrors[index] = { ...newErrors[index], firstName: 'Nome é obrigatório' }
        isValid = false
      }
      if (!participant.lastName.trim()) {
        newErrors[index] = { ...newErrors[index], lastName: 'Sobrenome é obrigatório' }
        isValid = false
      }
      if (!participant.email.trim() || !/\S+@\S+\.\S+/.test(participant.email)) {
        newErrors[index] = { ...newErrors[index], email: 'Email inválido' }
        isValid = false
      }
      if (!participant.document || participant.document.length !== 14) {
        newErrors[index] = { ...newErrors[index], document: 'CPF inválido' }
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handlePurchase = async () => {
    if (!validateForm()) {
      toast.error('Por favor, preencha todos os campos corretamente')
      return
    }

    if (!user) {
      toast.error('Você precisa estar logado para comprar ingressos')
      navigate('/login')
      return
    }

    try {
      const participantsInfo: ParticipantInfo[] = participants.map(p => ({
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        document: p.document
      }))

      const result = await purchaseTicket({
        eventId: state.eventId,
        categoryId: state.categoryId,
        quantity: state.quantity,
        participants: participantsInfo,
        paymentMethod,
        installments: paymentMethod === 'CREDIT_CARD' ? installments : undefined
      })

      if (result && result.length > 0) {
        toast.success(`Ingresso${result.length > 1 ? 's' : ''} comprado${result.length > 1 ? 's' : ''} com sucesso!`)
        navigate('/my-tickets')
      } else {
        toast.error('Erro ao comprar ingresso')
      }
    } catch (error: any) {
      console.error('Erro completo na compra:', error)
      toast.error(`Erro ao comprar ingresso: ${error?.message || 'Erro desconhecido'}`)
    }
  }

  if (!state) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda - Dados dos Participantes */}
          <div className="lg:col-span-2 space-y-8">
            {/* Seção: Seleção de Ingressos */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Selecione os Ingressos</h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{state.categoryName}</h3>
                      <p className="text-sm text-gray-600">1x {state.categoryName}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Preço unitário</p>
                        <p className="text-lg font-bold text-blue-600">R$ {formatPrice(state.categoryPrice)}</p>
                      </div>
                      <div className="border-l border-gray-200 pl-4">
                        <p className="text-sm text-gray-600">Quantidade</p>
                        <p className="text-lg font-bold">{state.quantity}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção: Dados dos Participantes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Dados dos Participantes ({state.quantity})
              </h2>

              {participants.map((participant, index) => (
                <div key={index} className="mb-6 last:mb-0 border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <h3 className="font-semibold text-gray-900">Participante {index + 1}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => useMyData(index)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Usar meus dados
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={`firstName-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Nome
                      </label>
                      <input
                        type="text"
                        id={`firstName-${index}`}
                        value={participant.firstName}
                        onChange={(e) => handleParticipantChange(index, 'firstName', e.target.value)}
                        placeholder="Nome"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors[index]?.firstName && (
                        <p className="text-red-500 text-xs mt-1">{errors[index].firstName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor={`lastName-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Sobrenome
                      </label>
                      <input
                        type="text"
                        id={`lastName-${index}`}
                        value={participant.lastName}
                        onChange={(e) => handleParticipantChange(index, 'lastName', e.target.value)}
                        placeholder="Sobrenome"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors[index]?.lastName && (
                        <p className="text-red-500 text-xs mt-1">{errors[index].lastName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor={`email-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id={`email-${index}`}
                        value={participant.email}
                        onChange={(e) => handleParticipantChange(index, 'email', e.target.value)}
                        placeholder="email@exemplo.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors[index]?.email && (
                        <p className="text-red-500 text-xs mt-1">{errors[index].email}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor={`document-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Documento
                      </label>
                      <input
                        type="text"
                        id={`document-${index}`}
                        value={participant.document}
                        onChange={(e) => handleParticipantChange(index, 'document', e.target.value)}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors[index]?.document && (
                        <p className="text-red-500 text-xs mt-1">{errors[index].document}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna Direita - Resumo do Pedido e Pagamento */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Resumo do Pedido</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{state.quantity}x {state.categoryName}</span>
                  <span className="text-gray-900">R$ {formatPrice(state.categoryPrice)}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-purple-600">R$ {calculateTotal()}</span>
                </div>
              </div>

              {/* Método de Pagamento */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Método de Pagamento</h3>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="PIX"
                      checked={paymentMethod === 'PIX'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="mr-3"
                    />
                    <span className="text-sm">PIX</span>
                  </label>
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CREDIT_CARD"
                      checked={paymentMethod === 'CREDIT_CARD'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="mr-3"
                    />
                    <span className="text-sm">Cartão de Crédito</span>
                  </label>
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="DEBIT_CARD"
                      checked={paymentMethod === 'DEBIT_CARD'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="mr-3"
                    />
                    <span className="text-sm">Cartão de Débito</span>
                  </label>
                </div>

                {paymentMethod === 'CREDIT_CARD' && (
                  <div className="mt-3">
                    <label htmlFor="installments" className="block text-sm font-medium text-gray-700 mb-1">
                      Parcelas
                    </label>
                    <select
                      id="installments"
                      value={installments}
                      onChange={(e) => setInstallments(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                        <option key={num} value={num}>
                          {num}x
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <button
                onClick={handlePurchase}
                disabled={loading}
                className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processando...' : 'Finalizar Compra'}
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Ao finalizar, você concorda com nossos termos de uso
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

