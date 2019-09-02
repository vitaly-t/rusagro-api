import { Module } from '@nestjs/common';
import { MachineBrandsService } from './machine-brands.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MachineBrandsEntity } from './machine-brands.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MachineBrandsEntity])],
  providers: [MachineBrandsService],
})
export class MachineBrandsModule {
}
