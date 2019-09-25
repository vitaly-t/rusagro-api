import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LogService } from './log.service';

@UseGuards(AuthGuard('jwt'))
@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {
  }

  @Post()
  async sendLogs(@Body() body) {
    return await this.logService.sendLog(body);
  }
}
