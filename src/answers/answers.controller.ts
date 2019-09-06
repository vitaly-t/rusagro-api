import { Controller, Get, Post, Request, UseGuards, Body, UseInterceptors, UploadedFiles, Param, Put } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnswersService } from './answers.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@UseGuards(AuthGuard('jwt'))
@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {
  }

  @Get()
  async findAll(@Request() req) {
    return await this.answersService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.answersService.findOne(id);
  }

  // TODO: files validation
  @Post('create')
  @UseInterceptors(FilesInterceptor('files', 3))
  async uploadFile(@UploadedFiles() files, @Body() body, @Request() req) {
    const userId = req.user.id;
    const machineId = body.machineId;
    return await this.answersService.createAnswer(userId, machineId, files);
  }

  @Put(':id')
  async saveAnswer(@Body() body, @Param('id') answerId: number) {
    return this.answersService.saveAnswer(answerId, body.answer);
  }
}
