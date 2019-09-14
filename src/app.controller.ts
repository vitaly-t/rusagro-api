import { Controller, Get, HttpCode } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('ping')
  @HttpCode(202)
  async ping() {
    return { success: true };
  }
}
