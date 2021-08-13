import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { commonConfig } from '../configs/common';
import { S3ObjectsService } from '../s3-objects/s3-objects.service';
import { OrdersService } from '../orders/orders.service';
import { CreateReportDto } from './dto/create-report.dto';
import { FileFormat, FileFormatType } from './types/report.type';
import { ExportResponse } from './utils/exportResponse';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Stimulsoft = require('stimulsoft-reports-js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

@Injectable()
export class ReportsService {
  constructor(
    private readonly s3ObjectsService: S3ObjectsService,
    private readonly ordersService: OrdersService,
  ) {
    // Loading fonts
    Stimulsoft.Base.StiFontCollection.addOpentypeFontFile(
      commonConfig.FONT_FILE_PATH,
    );
  }

  getFileFormat({ formatId }: { formatId: FileFormatType }): number {
    switch (formatId) {
      case FileFormat.Pdf:
        return Stimulsoft.Report.StiExportFormat.Pdf;
      case FileFormat.Word:
        return Stimulsoft.Report.StiExportFormat.Word2007;
      case FileFormat.Excel:
        return Stimulsoft.Report.StiExportFormat.Excel2007;
      default:
        Logger.error(
          `[ERROR] - This file format is not yet supported! [formatId: ${formatId}]`,
        );
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: `This file format is not yet supported! [formatId: ${formatId}]`,
          },
          HttpStatus.BAD_REQUEST,
        );
    }
  }

  getFileExtension({ formatId }: { formatId: FileFormatType }): string {
    switch (formatId) {
      case FileFormat.Pdf:
        return 'pdf';
      case FileFormat.Word:
        return 'docx';
      case FileFormat.Excel:
        return 'xlsx';
      default:
        Logger.error(
          `[ERROR] - This file extension is not yet supported! [formatId: ${formatId}]`,
        );
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: `This file extension is not yet supported! [formatId: ${formatId}]`,
          },
          HttpStatus.BAD_REQUEST,
        );
    }
  }

  async setTemplate(templateName: string): Promise<void> {
    const templatePath = `.tmp/template/${templateName}.mrt`;
    if (!fs.existsSync(templatePath)) {
      const reportTemplate = await this.s3ObjectsService
        .download({
          filePath: `${commonConfig.S3_TEMPLATE_PREFIX}/${templateName}.mrt`,
          bucketName: commonConfig.REPORTING_BUCKET,
        })
        .catch((err) => {
          Logger.error(`[ERROR] - ${err?.message}`);
          throw new HttpException(
            {
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              error: `${err?.message}`,
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        });
      fs.writeFileSync(templatePath, reportTemplate.Body);
    }
  }

  async export(params: CreateReportDto): Promise<ExportResponse> {
    const createReportDto = plainToClass(CreateReportDto, params);
    if (!createReportDto.hasRequiredAttributes) {
      Logger.error(`[ERROR] - The parameter is invalid!`);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: `The parameter is invalid!`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const { orderId, consoleEmail } = params;
    // Get Item from DynamoDB
    const item = await this.ordersService.findOne({ orderId });
    // Check consoleEmail
    if (consoleEmail !== item.consoleEmail) {
      Logger.error(`[ERROR] - Forbidden! [consoleEmail: ${consoleEmail}]`);
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: `Forbidden! [consoleEmail: ${consoleEmail}]`,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const { templateAttributes, formatId, templateName } = item;
    // Get File Extension
    const extension = this.getFileExtension({ formatId });
    // Get Export Format
    const exportFormat = this.getFileFormat({ formatId });
    const fileName = `${templateName}.${extension}`;
    const uploadPrefix = `report/${orderId}/${new Date().toISOString()}`;
    // Creating new report
    const report = new Stimulsoft.Report.StiReport();
    // Set report template file
    await this.setTemplate(`${templateName}`);
    report.loadFile(`.tmp/template/${templateName}.mrt`);
    // Remove all connections from the report template
    report.dictionary.databases.clear();
    // Create new DataSet object
    const dataSet = new Stimulsoft.System.Data.DataSet();
    // Load the JSON data retrieved from DynamoDB
    dataSet.readJson(templateAttributes);
    // Register DataSet object
    report.regData(dataSet.dataSetName, '', dataSet);
    /**
     * @todo
     * renderAsync2()とexportDocumentAsync2()を使用するとawaitを使えるが、
     * 今、Bugがあるようなので、一旦はrenderAsync()とexportDocumentAsync()を使用する
     */
    return new Promise((resolve, reject) => {
      try {
        // Render report with registered data
        report.renderAsync(() => {
          // Export to PDF
          report.exportDocumentAsync(async (pdfData) => {
            // Converting Array into buffer
            const buffer = Buffer.from(pdfData);
            // Uploaded the exported file
            const sendData = await this.s3ObjectsService.upload({
              file: {
                name: fileName,
                data: buffer,
              },
              bucketName: commonConfig.REPORTING_BUCKET,
              prefix: uploadPrefix,
            });
            // Get a pre-signed URL for getObject operation
            this.s3ObjectsService.getSignedUrl({
              filePath: sendData?.Key,
              bucketName: commonConfig.REPORTING_BUCKET,
            });
            resolve(sendData);
          }, exportFormat);
        });
      } catch (err) {
        Logger.error(`[ERROR] - ${err?.message}`);
        reject(
          new HttpException(
            {
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              error: `${err?.message}`,
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        );
      }
    });
  }
}
