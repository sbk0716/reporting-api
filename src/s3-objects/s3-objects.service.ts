import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { commonConfig } from '../configs/common';
import { DownloadParams } from './utils/downloadParams';
import { UploadParams } from './utils/uploadParams';

@Injectable()
export class S3ObjectsService {
  async upload(params: UploadParams): Promise<AWS.S3.ManagedUpload.SendData> {
    const { file, bucketName, prefix } = params;
    const key = `${prefix || ''}/${file.name}`;
    const buffer = Buffer.from(file.data);
    const uploadParams = {
      Bucket: bucketName,
      Body: buffer,
      Key: key,
    };
    const config = { region: commonConfig.REGION };
    if (commonConfig.NODE_ENV === 'development') {
      config['accessKeyId'] = process.env.ACCESS_KEY_ID;
      config['secretAccessKey'] = process.env.SECRET_ACCESS_KEY;
    }
    AWS.config.update(config);
    const sendData = await new AWS.S3.ManagedUpload({
      params: uploadParams,
    })
      .promise()
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
    Logger.log(`[INFO] - sendData.Key is ${sendData?.Key}`);
    return sendData;
  }

  async download(params: DownloadParams): Promise<AWS.S3.GetObjectOutput> {
    const { filePath, bucketName } = params;
    const config = { region: commonConfig.REGION };
    if (commonConfig.NODE_ENV === 'development') {
      config['accessKeyId'] = process.env.ACCESS_KEY_ID;
      config['secretAccessKey'] = process.env.SECRET_ACCESS_KEY;
    }
    AWS.config.update(config);
    const s3 = new AWS.S3();
    const getParams = {
      Bucket: bucketName,
      Key: filePath,
    };
    const s3Object = await s3
      .getObject(getParams)
      .promise()
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
    if (s3Object?.ContentLength === 0) {
      Logger.error(
        `[ERROR] - ContentLength is zero! [ContentLength: ${s3Object?.ContentLength}]`,
      );
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: `ContentLength is zero! [ContentLength: ${s3Object?.ContentLength}]`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return s3Object;
  }

  async getSignedUrl(params: DownloadParams): Promise<string> {
    const { filePath, bucketName } = params;
    const config = { region: commonConfig.REGION };
    if (commonConfig.NODE_ENV === 'development') {
      config['accessKeyId'] = process.env.ACCESS_KEY_ID;
      config['secretAccessKey'] = process.env.SECRET_ACCESS_KEY;
    }
    AWS.config.update(config);
    const s3 = new AWS.S3();
    const operation = 'getObject';
    const getParams = {
      Bucket: bucketName,
      Key: filePath,
      Expires: 300,
    };
    const url = await s3.getSignedUrlPromise(operation, getParams);
    Logger.log(`[INFO] - The URL is ${url}`);
    return url;
  }
}
