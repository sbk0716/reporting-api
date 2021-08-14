import { Test, TestingModule } from '@nestjs/testing';
import { StatusService } from './status.service';

describe('StatusService', () => {
  let service: StatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusService],
    }).compile();

    service = module.get<StatusService>(StatusService);
  });

  it('[getStatus]should be defined', () => {
    expect(service.getStatus()).toBeDefined();
  });
});
