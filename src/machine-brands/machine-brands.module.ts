import { Module } from '@nestjs/common';
import { MachineBrandsService } from './machine-brands.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MachineBrand } from './machine-brands.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MachineBrand])],
  providers: [MachineBrandsService],
})
export class MachineBrandsModule {
}
