import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { S3ObjectsService } from '../s3-objects/s3-objects.service';
import { OrdersService } from '../orders/orders.service';

/**
 * ReportsModuleを定義する
 * ReportsServiceで必要となるServiceをDIする為、
 * 各種ServiceをprovidersにSetする
 */
@Module({
  controllers: [ReportsController],
  providers: [ReportsService, S3ObjectsService, OrdersService],
})
export class ReportsModule {}
