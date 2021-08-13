import { IsUUID } from 'class-validator';

export class FindOneParams {
  @IsUUID()
  orderId: string;
}
