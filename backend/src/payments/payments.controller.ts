import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Pagamentos')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os pagamentos' })
  @ApiResponse({ status: 200, description: 'Lista de pagamentos obtida com sucesso' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filtrar por usuário' })
  @ApiQuery({ name: 'ticketId', required: false, description: 'Filtrar por ingresso' })
  async findAll(@Query('userId') userId?: string, @Query('ticketId') ticketId?: string) {
    if (userId) {
      return this.paymentsService.findByUserId(userId);
    }
    if (ticketId) {
      return this.paymentsService.findByTicketId(ticketId);
    }
    return this.paymentsService.findAll();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter estatísticas de pagamentos' })
  @ApiResponse({ status: 200, description: 'Estatísticas obtidas com sucesso' })
  async getStats() {
    return this.paymentsService.getPaymentStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter pagamento por ID' })
  @ApiResponse({ status: 200, description: 'Pagamento obtido com sucesso' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo pagamento' })
  @ApiResponse({ status: 201, description: 'Pagamento criado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async create(@Body() paymentData: any) {
    return this.paymentsService.create(paymentData);
  }

  @Put(':id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aprovar pagamento' })
  @ApiResponse({ status: 200, description: 'Pagamento aprovado com sucesso' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async approve(@Param('id') id: string) {
    return this.paymentsService.approvePayment(id);
  }

  @Put(':id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rejeitar pagamento' })
  @ApiResponse({ status: 200, description: 'Pagamento rejeitado com sucesso' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async reject(@Param('id') id: string) {
    return this.paymentsService.rejectPayment(id);
  }

  @Put(':id/refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reembolsar pagamento' })
  @ApiResponse({ status: 200, description: 'Pagamento reembolsado com sucesso' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async refund(@Param('id') id: string) {
    return this.paymentsService.refundPayment(id);
  }
}
