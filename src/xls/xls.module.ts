import { Module } from '@nestjs/common';
import { XlsService } from './xls.service';

@Module({
  providers: [XlsService]
})
export class XlsModule {}
