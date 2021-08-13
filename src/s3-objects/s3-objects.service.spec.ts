import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { S3ObjectsService } from './s3-objects.service';
import * as AWS from 'aws-sdk';
import { DownloadParams } from './utils/downloadParams';
import { UploadParams } from './utils/uploadParams';
import { testObjectInfo } from '../testData/reportObject';
import { testConfig } from '../testData/config';

describe('S3ObjectsService', () => {
  let service: S3ObjectsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3ObjectsService],
    }).compile();

    service = module.get<S3ObjectsService>(S3ObjectsService);
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('[METHOD]upload', () => {
    /**
     * 正常系
     */
    describe('[NORMAL]execute upload method with the correct UploadParams', () => {
      let action: Promise<AWS.S3.GetObjectOutput>;
      // Use bucketName that exists in the Test Environment
      const bucketName = testConfig.REPORTING_BUCKET;
      // Use fileName that exists in the Test Environment
      const fileName = testObjectInfo.fileName;
      // Use prefix that exists in the Test Environment
      const prefix = testObjectInfo.prefix;
      // Use a test data converted from a string to a buffer
      const buffer = testObjectInfo.buffer;

      beforeAll(async () => {
        const params: UploadParams = {
          file: {
            name: fileName,
            data: buffer,
          },
          bucketName,
          prefix,
        };
        action = service.upload(params);
      });

      it('result should be string', async () => {
        const result = await action;
        expect(result).toBeDefined();
      });
    });

    /**
     * 異常系(1)
     */
    describe('execute upload method with the incorrect UploadParams', () => {
      let action: Promise<AWS.S3.GetObjectOutput>;
      // Use bucketName that does not exist in the Test Environment
      const incorrectBucketName = '___incorrect-stg-gw-reporting-file';
      // Use fileName that exists in the Test Environment
      const fileName = testObjectInfo.fileName;
      // Use prefix that exists in the Test Environment
      const prefix = testObjectInfo.prefix;
      // Use a test data converted from a string to a buffer
      const buffer = testObjectInfo.buffer;

      beforeAll(async () => {
        const params: UploadParams = {
          file: {
            name: fileName,
            data: buffer,
          },
          bucketName: incorrectBucketName,
          prefix,
        };
        action = service.upload(params);
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
  });

  describe('[METHOD]download', () => {
    /**
     * 正常系
     */
    describe('[NORMAL]execute download method with the correct DownloadParams', () => {
      let action: Promise<AWS.S3.GetObjectOutput>;
      // Use bucketName that exists in the Test Environment
      const bucketName = testConfig.REPORTING_BUCKET;
      // Use filePath that exists in the Test Environment
      const filePath = testObjectInfo.key;

      beforeAll(async () => {
        const params: DownloadParams = {
          filePath,
          bucketName,
        };
        action = service.download(params);
      });

      it('result should be AWS.S3.GetObjectOutput', async () => {
        const result = await action;
        expect(result?.AcceptRanges).toBeDefined();
        expect(result?.LastModified).toBeDefined();
        expect(result?.ContentLength).toBeDefined();
        expect(result?.ETag).toBeDefined();
        expect(result?.ContentType).toBeDefined();
        expect(result?.Metadata).toBeDefined();
        expect(result?.Body).toBeDefined();
      });
    });

    /**
     * 異常系(1)
     */
    describe('execute download method with the incorrect DownloadParams', () => {
      let action: Promise<AWS.S3.GetObjectOutput>;
      // Use bucketName that does not exist in the Test Environment
      const incorrectBucketName = '___incorrect-stg-gw-reporting-file';
      // Use filePath that exists in the Test Environment
      const filePath = testObjectInfo.key;

      beforeAll(async () => {
        // Use the parameters that exist in the Test Environment
        const params: DownloadParams = {
          filePath,
          bucketName: incorrectBucketName,
        };
        action = service.download(params);
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
     * 異常系(2)
     */
    describe('execute download method fails with error', () => {
      let getObjectSpy: jest.SpyInstance;
      let action: Promise<AWS.S3.GetObjectOutput>;
      // Use bucketName that exists in the Test Environment
      const bucketName = testConfig.REPORTING_BUCKET;
      // Use filePath that exists in the Test Environment
      const filePath = testObjectInfo.key;

      beforeAll(async () => {
        // create a mock function(AWS.Request.prototype.promise)
        getObjectSpy = jest
          .spyOn(AWS.Request.prototype, 'promise')
          .mockResolvedValue({ ContentLength: 0 });
        // Use the parameters that exist in the Test Environment
        const params: DownloadParams = {
          filePath,
          bucketName,
        };
        action = service.download(params);
      });

      afterAll(() => {
        getObjectSpy?.mockRestore();
      });

      it('action should throw error HttpException(BAD_REQUEST)', async () => {
        expect.assertions(3);
        try {
          await action;
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.status).toBe(HttpStatus.BAD_REQUEST);
          expect(error.response.error).toMatch(/ContentLength is zero/);
        }
      });
    });
  });

  describe('[METHOD]getSignedUrl', () => {
    /**
     * 正常系
     */
    describe('[NORMAL]execute getSignedUrl method with the correct DownloadParams', () => {
      let action: Promise<string>;
      // Use bucketName that exists in the Test Environment
      const bucketName = testConfig.REPORTING_BUCKET;
      // Use filePath that exists in the Test Environment
      const filePath = testObjectInfo.key;

      beforeAll(async () => {
        // Use the parameters that exist in the Test Environment
        const params: DownloadParams = {
          filePath,
          bucketName,
        };
        action = service.getSignedUrl(params);
      });

      it('result should be string', async () => {
        const result = await action;
        expect(result).toBeDefined();
      });
    });
  });
});
