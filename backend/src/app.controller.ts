import { Controller, Get, Redirect, Logger } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@ApiTags('health')
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @Redirect('/docs', 302)
  @ApiOperation({ summary: 'Redirect to API docs' })
  root() {
    this.logger.log('Root route hit at /api - redirecting to /docs');
    return;
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  getHealth() {
    this.logger.log('Health check endpoint hit');
    return this.appService.getHealth();
  }
}
