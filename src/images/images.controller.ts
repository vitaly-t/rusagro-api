import { Body, Controller, Get, Param, Post, Request, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ImagesService } from './images.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Res() res: Response) {
    const img = await this.imagesService.findOne(id);
    res.status(200).send(img);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async saveImages(@UploadedFiles() files, @Request() req) {
    return await this.imagesService.saveImages(files, req);
  }
}
