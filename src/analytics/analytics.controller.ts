import { Controller, Get, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {
  }

  @Get(':date')
  async getCommonAnalytics(@Param('date') date: string) {
    return await this.analyticsService.getCommonAnalytics(date);
  }
}
