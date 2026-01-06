import { Test, TestingModule } from '@nestjs/testing';
import { AnamneseController } from './anamnese.controller';

describe('AnamneseController', () => {
  let controller: AnamneseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnamneseController],
    }).compile();

    controller = module.get<AnamneseController>(AnamneseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
