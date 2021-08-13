import { Injectable } from '@nestjs/common';

@Injectable()
export class StatusService {
  getStatus(): string {
    return 'I am living!';
  }
}
