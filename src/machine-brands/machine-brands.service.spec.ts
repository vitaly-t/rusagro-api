import { Test, TestingModule } from '@nestjs/testing';
import { MachineBrandsService } from './machine-brands.service';

describe('MachineBrandsService', () => {
  let service: MachineBrandsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MachineBrandsService],
    }).compile();

    service = module.get<MachineBrandsService>(MachineBrandsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
