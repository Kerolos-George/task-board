import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configureApp(app: INestApplication) {
  console.log('[ConfigureApp] Starting app configuration');
  
  const frontendUrl = process.env.FRONTEND_URL;
  console.log(`[ConfigureApp] CORS origins: ${frontendUrl || 'all origins (true)'}`);
  
  app.enableCors({
    origin: frontendUrl
      ? frontendUrl.split(',').map((origin) => origin.trim())
      : true,
    credentials: true,
  });

  console.log('[ConfigureApp] Setting global prefix to "api"');
  app.setGlobalPrefix('api');
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger configuration
  console.log('[ConfigureApp] Setting up Swagger at /docs');
  const config = new DocumentBuilder()
    .setTitle('Task Board API')
    .setDescription(
      'Team task board API — auth, projects, tasks, filters, audit log',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('/', 'API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  console.log(`[ConfigureApp] Swagger document created with ${Object.keys(document.paths || {}).length} paths`);
  
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Task Board API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });
  
  console.log('[ConfigureApp] Configuration complete. Routes available at:');
  console.log('  - /api (redirects to /docs)');
  console.log('  - /api/health');
  console.log('  - /docs (Swagger UI)');
}
