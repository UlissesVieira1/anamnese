import { Test, TestingModule } from '@nestjs/testing';
import { AnamneseService } from './anamnese.service';

describe('AnamneseService', () => {
  let service: AnamneseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnamneseService],
    }).compile();

    service = module.get<AnamneseService>(AnamneseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
