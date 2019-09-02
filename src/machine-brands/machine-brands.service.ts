import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MachineBrandsEntity } from './machine-brands.entity';

@Injectable()
export class MachineBrandsService {
  constructor(
    @InjectRepository(MachineBrandsEntity)
    private readonly machineBrandsRepository: Repository<MachineBrandsEntity>,
  ) {
  }

  // @Get()
  // async findAll(): Promise<MachineBrand[]> {
  //
  // }
}
