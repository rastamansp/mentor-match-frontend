import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Ingressos')
@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os ingressos' })
  @ApiResponse({ status: 200, description: 'Lista de ingressos obtida com sucesso' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filtrar por usuário' })
  @ApiQuery({ name: 'eventId', required: false, description: 'Filtrar por evento' })
  async findAll(@Query('userId') userId?: string, @Query('eventId') eventId?: string) {
    if (userId) {
      return this.ticketsService.findByUserId(userId);
    }
    if (eventId) {
      return this.ticketsService.findByEventId(eventId);
    }
    return this.ticketsService.findAll();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter estatísticas de ingressos' })
  @ApiResponse({ status: 200, description: 'Estatísticas obtidas com sucesso' })
  @ApiQuery({ name: 'eventId', required: false, description: 'Filtrar por evento' })
  async getStats(@Query('eventId') eventId?: string) {
    return this.ticketsService.getTicketStats(eventId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter ingresso por ID' })
  @ApiResponse({ status: 200, description: 'Ingresso obtido com sucesso' })
  @ApiResponse({ status: 404, description: 'Ingresso não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.ticketsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo ingresso' })
  @ApiResponse({ status: 201, description: 'Ingresso criado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async create(@Body() ticketData: any) {
    return this.ticketsService.create(ticketData);
  }

  @Post(':id/validate')
  @ApiOperation({ summary: 'Validar ingresso por QR Code' })
  @ApiResponse({ status: 200, description: 'Validação realizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Ingresso inválido' })
  async validate(@Param('id') id: string, @Body() body: { qrCodeData: string }) {
    return this.ticketsService.validateTicket(body.qrCodeData);
  }

  @Put(':id/use')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar ingresso como usado' })
  @ApiResponse({ status: 200, description: 'Ingresso marcado como usado' })
  @ApiResponse({ status: 404, description: 'Ingresso não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async use(@Param('id') id: string) {
    return this.ticketsService.useTicket(id);
  }

  @Put(':id/transfer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Transferir ingresso para outro usuário' })
  @ApiResponse({ status: 200, description: 'Ingresso transferido com sucesso' })
  @ApiResponse({ status: 404, description: 'Ingresso não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async transfer(@Param('id') id: string, @Body() transferData: any) {
    return this.ticketsService.transferTicket(
      id,
      transferData.newUserId,
      transferData.newUserName,
      transferData.newUserEmail
    );
  }

  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancelar ingresso' })
  @ApiResponse({ status: 200, description: 'Ingresso cancelado com sucesso' })
  @ApiResponse({ status: 404, description: 'Ingresso não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async cancel(@Param('id') id: string) {
    return this.ticketsService.cancelTicket(id);
  }
}
