import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HistoryService } from './history.service';

@UseGuards(AuthGuard('jwt'))
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {
  }

  @Get(':brandId')
  async findOne(@Param('brandId') brandId: number) {
    return await this.historyService.findOne(brandId);
  }
}
