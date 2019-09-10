import { Controller, Get, Post, Request, UseGuards, Body, UseInterceptors, UploadedFiles, Param, Put } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnswersService } from './answers.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MailService } from '../core/mail/mail.service';
import { XlsService } from '../core/xls/xls.service';

@UseGuards(AuthGuard('jwt'))
@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService,
              private readonly mailService: MailService,
              private readonly xlsService: XlsService) {
  }

  @Get('pics')
  async getPics() {
    return await this.answersService.findPics(10);
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

  @Post(':id/send')
  async sendAnswer(@Param('id') id: number) {
    const answer = await this.answersService.findOne(id);
    const xls = this.xlsService.buildXLS(answer);
    const emails = await this.mailService.findAll();
    const images = await this.answersService.findPics(id);
    const attachment = [{ filename: 'test.xls', content: xls }];
    images.forEach((element, id) => {
      attachment.push({
        filename: 'image' + id + '.jpg',
        content: element.image
      })
    });

    return await this.mailService.sendMail(emails.array, '', attachment);
  }
}
