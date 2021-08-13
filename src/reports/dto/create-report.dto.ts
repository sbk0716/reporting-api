import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({
    required: true,
    description: 'UUID for order',
    default: '80000000-4000-4000-4000-120000000000',
  })
  @IsNotEmpty()
  @IsUUID()
  orderId: string;

  @ApiProperty({
    required: true,
    description: 'Email for order',
    default: 'sameEmailA@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  consoleEmail: string;

  get hasRequiredAttributes(): boolean {
    if (this.orderId && this.consoleEmail) return true;
    return false;
  }
}
