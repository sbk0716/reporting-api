import { Controller, Post, Body } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ExportResponse } from './utils/exportResponse';
import {
  ApiTags,
  ApiSecurity,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Reports')
@ApiSecurity('access-key')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('export')
  @ApiOperation({ summary: 'Export Report' })
  @ApiResponse({
    status: 200,
    description: 'The report has been successfully exported.',
    type: ExportResponse,
  })
  async export(@Body() createReport: CreateReportDto) {
    return this.reportsService.export(createReport);
  }
}
