import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmailsService } from './emails.service';

@UseGuards(AuthGuard('jwt'))
@Controller('emails')
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {
  }

  @Get()
  async findAll() {
    return await this.emailsService.findAll();
  }

  @Delete(':id')
  async deleteEmail(@Param('id') id: number) {
    return await this.emailsService.delete(id);
  }
}
