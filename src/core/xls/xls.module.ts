import { Module } from '@nestjs/common';
import { XlsService } from './xls.service';

@Module({
  providers: [XlsService],
  exports: [XlsService],
})
export class XlsModule {
}
