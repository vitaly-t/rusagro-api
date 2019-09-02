import { Test, TestingModule } from '@nestjs/testing';
import { MachineTypesService } from './machine-types.service';

describe('MachineTypesService', () => {
  let service: MachineTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MachineTypesService],
    }).compile();

    service = module.get<MachineTypesService>(MachineTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
