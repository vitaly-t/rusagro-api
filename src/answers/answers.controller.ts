import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnswersService } from './answers.service';

@UseGuards(AuthGuard('jwt'))
@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {
  }

  @Get()
  async findAll(@Request() req) {
    return await this.answersService.findAll(req.user.id);
  }
}
