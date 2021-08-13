import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReportsModule } from './reports/reports.module';
import { StatusModule } from './status/status.module';

/**
 * `@Module()`でModuleとして認識される
 * AppのRootModuleであるAppModuleを定義する
 * importsの配列の中に他のModuleを指定し、別のModuleをimportすることが可能
 */
@Module({
  imports: [ReportsModule, StatusModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
