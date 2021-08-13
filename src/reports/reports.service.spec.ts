import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { ReportsService } from './reports.service';
import { S3ObjectsService } from '../s3-objects/s3-objects.service';
import { OrdersService } from '../orders/orders.service';
import { CreateReportDto } from './dto/create-report.dto';
import { FindOneResponse } from '../orders/utils/findOneResponse';
import { ExportResponse } from './utils/exportResponse';
import { testTemplateInfo } from '../testData/reportObject';
import { testOrderItem } from '../testData/orderItem';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Stimulsoft = require('stimulsoft-reports-js');

describe('ReportsService', () => {
  let service: ReportsService;
  let ordersService: OrdersService;
  let s3ObjectsService: S3ObjectsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportsService, S3ObjectsService, OrdersService],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    ordersService = module.get<OrdersService>(OrdersService);
    s3ObjectsService = module.get<S3ObjectsService>(S3ObjectsService);
  });

  it('[ReportsService]should be defined', () => {
    expect(service).toBeDefined();
  });

  it('OrdersService should be defined', () => {
    expect(ordersService).toBeDefined();
  });

  it('S3ObjectsService should be defined', () => {
    expect(s3ObjectsService).toBeDefined();
  });

  describe('[METHOD]export', () => {
    /**
     * 正常系
     */
    describe('[NORMAL]execute export method with the correct consoleEmail', () => {
      let findOneOrderSpy: jest.SpyInstance;
      let setTemplateSpy: jest.SpyInstance;
      let uploadSpy: jest.SpyInstance;
      let action: Promise<ExportResponse>;
      // Use orderId that exists in the Test Environment
      const orderId = testOrderItem.orderId;
      // Use consoleEmail that exists in the Test Environment
      const consoleEmail = testOrderItem.consoleEmail;
      // Use templateName that exists in the Test Environment
      const templateName = testTemplateInfo.templateName;
      // Use the correct formatId in the Test Environment
      const formatId = testOrderItem.formatId;

      beforeAll(() => {
        findOneOrderSpy = jest
          .spyOn(ordersService, 'findOne')
          .mockResolvedValue(
            plainToClass(FindOneResponse, {
              orderId,
              templateAttributes: {},
              formatId,
              templateName,
              consoleEmail,
            }),
          );

        setTemplateSpy = jest
          .spyOn(service, 'setTemplate')
          .mockResolvedValue(Promise.resolve());

        uploadSpy = jest.spyOn(s3ObjectsService, 'upload').mockResolvedValue(
          plainToClass(ExportResponse, {
            Location: 'string',
            ETag: 'string',
            Bucket: 'string',
            Key: 'string',
          }),
        );

        action = service.export(
          plainToClass(CreateReportDto, {
            consoleEmail,
            orderId,
          }),
        );
      });

      afterAll(() => {
        findOneOrderSpy?.mockRestore();
        setTemplateSpy?.mockRestore();
        uploadSpy?.mockRestore();
      });

      it('result should be ExportResponse', async () => {
        const result = await action;
        expect(result?.Location).toBeDefined();
        expect(result?.ETag).toBeDefined();
        expect(result?.Bucket).toBeDefined();
        expect(result?.Key).toBeDefined();
      });
    });

    /**
     * 異常系(1)
     */
    describe('execute export method with the incorrect parameter', () => {
      let action: Promise<ExportResponse>;
      // Use orderId that exists in the Test Environment
      const orderId = testOrderItem.orderId;
      // Use consoleEmail that exists in the Test Environment
      const consoleEmail = testOrderItem.consoleEmail;

      beforeAll(() => {
        action = service.export(
          plainToClass(CreateReportDto, {
            ___consoleEmail: consoleEmail,
            ___orderId: orderId,
          }),
        );
      });

      it('action should throw error HttpException(BAD_REQUEST)', async () => {
        expect.assertions(3);
        try {
          await action;
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.status).toBe(HttpStatus.BAD_REQUEST);
          expect(error.response.error).toMatch(/The parameter is invalid/);
        }
      });
    });
    /**
     * 異常系(2)
     */
    describe('execute export method with the incorrect consoleEmail', () => {
      let findOneOrderSpy: jest.SpyInstance;
      let action: Promise<ExportResponse>;
      // Use orderId that exists in the Test Environment
      const orderId = testOrderItem.orderId;
      // Use consoleEmail that exists in the Test Environment
      const consoleEmail = testOrderItem.consoleEmail;
      // Use templateName that exists in the Test Environment
      const templateName = testTemplateInfo.templateName;
      // Use consoleEmail that does not exist in the Test Environment
      const incorrectConsoleEmail = 'incorrect@gmail.com';

      beforeAll(() => {
        findOneOrderSpy = jest
          .spyOn(ordersService, 'findOne')
          .mockResolvedValue(
            plainToClass(FindOneResponse, {
              orderId,
              templateAttributes: {},
              formatId: 1,
              templateName,
              consoleEmail,
            }),
          );

        action = service.export(
          plainToClass(CreateReportDto, {
            consoleEmail: incorrectConsoleEmail,
            orderId,
          }),
        );
      });

      afterAll(() => {
        findOneOrderSpy?.mockRestore();
      });

      it('action should throw error HttpException(FORBIDDEN)', async () => {
        expect.assertions(3);
        try {
          await action;
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.status).toBe(HttpStatus.FORBIDDEN);
          expect(error.response.error).toMatch(/Forbidden/);
        }
      });
    });
    /**
     * 異常系(3)
     */
    describe('execute getFileExtension method with the incorrect formatId', () => {
      let findOneOrderSpy: jest.SpyInstance;
      let action: Promise<ExportResponse>;
      // Use orderId that exists in the Test Environment
      const orderId = testOrderItem.orderId;
      // Use consoleEmail that exists in the Test Environment
      const consoleEmail = testOrderItem.consoleEmail;
      // Use templateName that exists in the Test Environment
      const templateName = testTemplateInfo.templateName;
      // Use the incorrect formatId
      const incorrectFormatId = 999999999;

      beforeAll(() => {
        findOneOrderSpy = jest
          .spyOn(ordersService, 'findOne')
          .mockResolvedValue(
            plainToClass(FindOneResponse, {
              orderId,
              templateAttributes: {},
              formatId: incorrectFormatId,
              templateName,
              consoleEmail,
            }),
          );

        action = service.export(
          plainToClass(CreateReportDto, {
            consoleEmail,
            orderId,
          }),
        );
      });

      afterAll(() => {
        findOneOrderSpy?.mockRestore();
      });

      it('action should throw error HttpException(BAD_REQUEST)', async () => {
        expect.assertions(3);
        try {
          await action;
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.status).toBe(HttpStatus.BAD_REQUEST);
          expect(error.response.error).toMatch(
            /This file extension is not yet supported/,
          );
        }
      });
    });
    /**
     * 異常系(4)
     */
    describe('execute getFileFormat method with the incorrect formatId', () => {
      let findOneOrderSpy: jest.SpyInstance;
      let getFileExtensionSpy: jest.SpyInstance;
      let action: Promise<ExportResponse>;
      // Use orderId that exists in the Test Environment
      const orderId = testOrderItem.orderId;
      // Use consoleEmail that exists in the Test Environment
      const consoleEmail = testOrderItem.consoleEmail;
      // Use templateName that exists in the Test Environment
      const templateName = testTemplateInfo.templateName;
      // Use the incorrect formatId
      const incorrectFormatId = 999999999;

      beforeAll(() => {
        findOneOrderSpy = jest
          .spyOn(ordersService, 'findOne')
          .mockResolvedValue(
            plainToClass(FindOneResponse, {
              orderId,
              templateAttributes: {},
              formatId: incorrectFormatId,
              templateName,
              consoleEmail,
            }),
          );

        getFileExtensionSpy = jest
          .spyOn(service, 'getFileExtension')
          .mockReturnValue('pdf');

        action = service.export(
          plainToClass(CreateReportDto, {
            consoleEmail,
            orderId,
          }),
        );
      });

      afterAll(() => {
        findOneOrderSpy?.mockRestore();
        getFileExtensionSpy?.mockRestore();
      });

      it('action should throw error HttpException(BAD_REQUEST)', async () => {
        expect.assertions(3);
        try {
          await action;
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.status).toBe(HttpStatus.BAD_REQUEST);
          expect(error.response.error).toMatch(
            /This file format is not yet supported/,
          );
        }
      });
    });
    /**
     * 異常系(5)
     */
    describe('execute setTemplate method with the incorrect templateName', () => {
      let findOneOrderSpy: jest.SpyInstance;
      let getFileExtensionSpy: jest.SpyInstance;
      let getFileFormatSpy: jest.SpyInstance;
      let action: Promise<ExportResponse>;
      // Use orderId that exists in the Test Environment
      const orderId = testOrderItem.orderId;
      // Use consoleEmail that exists in the Test Environment
      const consoleEmail = testOrderItem.consoleEmail;
      // Use the correct formatId in the Test Environment
      const formatId = testOrderItem.formatId;
      // Use the incorrect templateName
      const incorrectTemplateName = 'xxxxxxxxx';

      beforeAll(() => {
        findOneOrderSpy = jest
          .spyOn(ordersService, 'findOne')
          .mockResolvedValue(
            plainToClass(FindOneResponse, {
              orderId,
              templateAttributes: {},
              formatId,
              templateName: incorrectTemplateName,
              consoleEmail,
            }),
          );

        getFileExtensionSpy = jest
          .spyOn(service, 'getFileExtension')
          .mockReturnValue('pdf');

        getFileFormatSpy = jest
          .spyOn(service, 'getFileFormat')
          .mockReturnValue(Stimulsoft.Report.StiExportFormat.Pdf);

        action = service.export(
          plainToClass(CreateReportDto, {
            consoleEmail,
            orderId,
          }),
        );
      });

      afterAll(() => {
        findOneOrderSpy?.mockRestore();
        getFileExtensionSpy?.mockRestore();
        getFileFormatSpy?.mockRestore();
      });

      it('action should throw error HttpException(INTERNAL_SERVER_ERROR)', async () => {
        expect.assertions(2);
        try {
          await action;
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        }
      });
    });
    /**
     * 異常系(6)
     */
    describe('execute renderAsync method fails with error', () => {
      let findOneOrderSpy: jest.SpyInstance;
      let setTemplateSpy: jest.SpyInstance;
      let renderReportSpy: jest.SpyInstance;
      let action: Promise<ExportResponse>;
      // Use orderId that exists in the Test Environment
      const orderId = testOrderItem.orderId;
      // Use consoleEmail that exists in the Test Environment
      const consoleEmail = testOrderItem.consoleEmail;
      // Use templateName that exists in the Test Environment
      const templateName = testTemplateInfo.templateName;
      // Use the correct formatId in the Test Environment
      const formatId = testOrderItem.formatId;

      beforeAll(() => {
        findOneOrderSpy = jest
          .spyOn(ordersService, 'findOne')
          .mockResolvedValue(
            plainToClass(FindOneResponse, {
              orderId,
              templateAttributes: {},
              formatId,
              templateName,
              consoleEmail,
            }),
          );

        setTemplateSpy = jest
          .spyOn(service, 'setTemplate')
          .mockResolvedValue(Promise.resolve());

        // create a mock function(Stimulsoft.Report.StiReport.prototype.renderAsync)
        renderReportSpy = jest
          .spyOn(Stimulsoft.Report.StiReport.prototype, 'renderAsync')
          .mockImplementation(() => {
            throw new Error(
              'Stimulsoft.Report.StiReport.prototype.renderAsync - INTERNAL_SERVER_ERROR',
            );
          });
        action = service.export(
          plainToClass(CreateReportDto, {
            consoleEmail,
            orderId,
          }),
        );
      });
      afterAll(() => {
        findOneOrderSpy?.mockRestore();
        setTemplateSpy?.mockRestore();
        renderReportSpy?.mockRestore();
      });
      it('action should throw error HttpException(INTERNAL_SERVER_ERROR)', async () => {
        expect.assertions(3);
        try {
          await action;
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
          expect(error.response.error).toMatch(/INTERNAL_SERVER_ERROR/);
        }
      });
    });
  });
});
