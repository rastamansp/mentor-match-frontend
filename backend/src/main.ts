import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração de CORS
  const corsOrigins = process.env.NODE_ENV === 'production' 
    ? [
        'https://events.gwan.com.br',
        'https://www.events.gwan.com.br',
        'http://events.gwan.com.br',
        'http://www.events.gwan.com.br',
        'https://api-events.gwan.com.br',
        'https://www.api-events.gwan.com.br',
        'http://api-events.gwan.com.br',
        'http://www.api-events.gwan.com.br'
      ]
    : ['http://localhost:3000', 'http://localhost:5173'];

  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Configuração de prefixo global
  app.setGlobalPrefix('api');

  // Configuração de validação global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Gwan Shop API')
    .setDescription('API da plataforma de eventos e venda de ingressos')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Servidor rodando na porta ${port}`);
  console.log(`📚 Documentação disponível em http://localhost:${port}/api`);
}

bootstrap();
