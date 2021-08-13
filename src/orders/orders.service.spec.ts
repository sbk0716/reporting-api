import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { OrdersService } from './orders.service';
import { FindOneParams } from './utils/findOneParams';
import { FindOneResponse } from './utils/findOneResponse';
import { testOrderItem } from '../testData/orderItem';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersService],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('[METHOD]findOne', () => {
    /**
     * 正常系
     */
    describe('[NORMAL]execute findOne method with the correct orderId', () => {
      let action: Promise<FindOneResponse>;
      // Use orderId that exists in the Test Environment
      const orderId = testOrderItem.orderId;

      beforeAll(async () => {
        const params: FindOneParams = {
          orderId,
        };
        action = service.findOne(params);
      });

      it('result should be FindOneResponse', async () => {
        const result = await action;
        expect(result?.orderId).toBeDefined();
        expect(result?.templateAttributes).toBeDefined();
        expect(result?.formatId).toBeDefined();
        expect(result?.templateName).toBeDefined();
        expect(result?.consoleEmail).toBeDefined();
      });
    });

    /**
     * 異常系(1)
     */
    describe('execute findOne method with the incorrect orderId', () => {
      let action: Promise<FindOneResponse>;
      // Use orderId that does not exist in the Test Environment
      const incorrectOrderId = '___00000000-0000-0000-0000-000000000000';

      beforeAll(async () => {
        const params: FindOneParams = {
          orderId: incorrectOrderId,
        };
        action = service.findOne(params);
      });

      it('action should throw error HttpException(NOT_FOUND)', async () => {
        expect.assertions(3);
        try {
          await action;
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.status).toBe(HttpStatus.NOT_FOUND);
          expect(error.response.error).toMatch(/Item does not exist/);
        }
      });
    });
    /**
     * 異常系(2)
     */
    describe('execute findOne method fails with error', () => {
      let getItemSpy: jest.SpyInstance;
      let action: Promise<FindOneResponse>;
      // Use orderId that exists in the Test Environment
      const orderId = testOrderItem.orderId;

      beforeAll(async () => {
        // create a mock function(AWS.Request.prototype.promise)
        getItemSpy = jest
          .spyOn(AWS.Request.prototype, 'promise')
          .mockRejectedValue(
            new Error(
              'AWS.Request.prototype.promise - throw error(INTERNAL_SERVER_ERROR)',
            ),
          );
        action = service.findOne({
          orderId,
        });
      });

      afterAll(() => {
        getItemSpy?.mockRestore();
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
