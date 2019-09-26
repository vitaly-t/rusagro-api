import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {
  }

  @Get()
  async getCommonAnalytics(@Query() query) {
    const { firstDate, lastDate } = query;
    return await this.analyticsService.getCommonAnalytics(firstDate, lastDate);
  }

  @Get('answers')
  async getAnswers(@Query() query) {
    const { firstDate, lastDate } = query;
    return await this.analyticsService.getAnswers(firstDate, lastDate);
  }

  @Get('answers/:id')
  async getAnswerDetails(@Param('id') id: number) {
    return await this.analyticsService.getAnswerDetails(id);
  }
}
