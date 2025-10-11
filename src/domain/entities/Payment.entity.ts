import { z } from 'zod'

export const PaymentSchema = z.object({
  id: z.string().uuid(),
  ticketId: z.string().uuid(),
  userId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.enum(['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'DIGITAL_WALLET']),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'REFUNDED']),
  pixCode: z.string().optional(),
  pixQrCode: z.string().optional(),
  installments: z.number().positive().optional(),
  transactionId: z.string().optional(),
  createdAt: z.string().datetime(),
  approvedAt: z.string().datetime().optional(),
  refundedAt: z.string().datetime().optional(),
})

export type Payment = z.infer<typeof PaymentSchema>

export class PaymentEntity {
  constructor(private readonly data: Payment) {}

  get id(): string { return this.data.id }
  get ticketId(): string { return this.data.ticketId }
  get userId(): string { return this.data.userId }
  get amount(): number { return this.data.amount }
  get method(): string { return this.data.method }
  get status(): string { return this.data.status }
  get pixCode(): string | undefined { return this.data.pixCode }
  get pixQrCode(): string | undefined { return this.data.pixQrCode }
  get installments(): number | undefined { return this.data.installments }
  get transactionId(): string | undefined { return this.data.transactionId }
  get createdAt(): string { return this.data.createdAt }
  get approvedAt(): string | undefined { return this.data.approvedAt }
  get refundedAt(): string | undefined { return this.data.refundedAt }

  isPending(): boolean {
    return this.data.status === 'PENDING'
  }

  isApproved(): boolean {
    return this.data.status === 'APPROVED'
  }

  isRejected(): boolean {
    return this.data.status === 'REJECTED'
  }

  isRefunded(): boolean {
    return this.data.status === 'REFUNDED'
  }

  canBeApproved(): boolean {
    return this.isPending()
  }

  canBeRejected(): boolean {
    return this.isPending()
  }

  canBeRefunded(): boolean {
    return this.isApproved()
  }

  isPix(): boolean {
    return this.data.method === 'PIX'
  }

  isCreditCard(): boolean {
    return this.data.method === 'CREDIT_CARD'
  }

  isDebitCard(): boolean {
    return this.data.method === 'DEBIT_CARD'
  }

  isDigitalWallet(): boolean {
    return this.data.method === 'DIGITAL_WALLET'
  }

  toJSON(): Payment {
    return this.data
  }
}
