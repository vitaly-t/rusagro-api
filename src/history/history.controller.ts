import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HistoryService } from './history.service';

@UseGuards(AuthGuard('jwt'))
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {
  }

  @Get(':brandId')
  async findHistory(@Param('brandId') brandId: any) {
    return await this.historyService.findHistory(brandId);
  }

  @Get('/answer/:answerId')
  async findOne(@Param('answerId') answerId: number) {
    return await this.historyService.findOne(answerId);
  }
}
