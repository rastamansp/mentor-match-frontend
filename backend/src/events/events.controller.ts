import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Eventos')
@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os eventos' })
  @ApiResponse({ status: 200, description: 'Lista de eventos obtida com sucesso' })
  @ApiQuery({ name: 'category', required: false, description: 'Filtrar por categoria' })
  @ApiQuery({ name: 'city', required: false, description: 'Filtrar por cidade' })
  async findAll(@Query('category') category?: string, @Query('city') city?: string) {
    if (category) {
      return this.eventsService.findByCategory(category);
    }
    if (city) {
      return this.eventsService.findByCity(city);
    }
    return this.eventsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter evento por ID' })
  @ApiResponse({ status: 200, description: 'Evento obtido com sucesso' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.eventsService.findById(id);
  }

  @Get(':id/ticket-categories')
  @ApiOperation({ summary: 'Obter categorias de ingressos do evento' })
  @ApiResponse({ status: 200, description: 'Categorias obtidas com sucesso' })
  async getTicketCategories(@Param('id') id: string) {
    return this.eventsService.getTicketCategories(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo evento' })
  @ApiResponse({ status: 201, description: 'Evento criado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async create(@Body() eventData: any) {
    return this.eventsService.create(eventData);
  }

  @Post(':id/ticket-categories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar categoria de ingresso' })
  @ApiResponse({ status: 201, description: 'Categoria criada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async createTicketCategory(@Param('id') id: string, @Body() categoryData: any) {
    return this.eventsService.createTicketCategory({ ...categoryData, eventId: id });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar evento' })
  @ApiResponse({ status: 200, description: 'Evento atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async update(@Param('id') id: string, @Body() eventData: any) {
    return this.eventsService.update(id, eventData);
  }

  @Put('ticket-categories/:categoryId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar categoria de ingresso' })
  @ApiResponse({ status: 200, description: 'Categoria atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async updateTicketCategory(@Param('categoryId') categoryId: string, @Body() categoryData: any) {
    return this.eventsService.updateTicketCategory(categoryId, categoryData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar evento' })
  @ApiResponse({ status: 200, description: 'Evento deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async delete(@Param('id') id: string) {
    return this.eventsService.delete(id);
  }
}
