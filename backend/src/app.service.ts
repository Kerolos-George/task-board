import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'task-board-api',
      timestamp: new Date().toISOString(),
    };
  }
}
