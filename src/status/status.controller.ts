import { Controller, Get } from '@nestjs/common';
import { StatusService } from './status.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Status')
@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  @ApiOperation({ summary: 'Container Health Check' })
  @ApiResponse({
    status: 200,
    description: 'The container health check has passed successfully.',
  })
  getStatus(): string {
    return this.statusService.getStatus();
  }
}
