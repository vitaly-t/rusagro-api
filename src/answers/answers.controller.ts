import { Controller, Get, Post, Request, UseGuards, Body } from '@nestjs/common';
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

  @Post()
  async createAnswer(@Request() req, @Body() body) {
    return await this.answersService.createAnswer(req.user.id)
  }
}
