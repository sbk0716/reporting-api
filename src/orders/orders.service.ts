import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import * as AWS from 'aws-sdk';
import { commonConfig } from '../configs/common';
import { FindOneParams } from './utils/findOneParams';
import { FindOneResponse } from './utils/findOneResponse';

@Injectable()
export class OrdersService {
  async findOne(params: FindOneParams): Promise<FindOneResponse> {
    const orderId = params?.orderId;
    const config = { region: commonConfig.REGION };
    if (commonConfig.NODE_ENV === 'development') {
      config['accessKeyId'] = process.env.ACCESS_KEY_ID;
      config['secretAccessKey'] = process.env.SECRET_ACCESS_KEY;
    }
    AWS.config.update(config);
    const key = AWS.DynamoDB.Converter.marshall(params);
    const dynamoDb = new AWS.DynamoDB();
    const item = await dynamoDb
      .getItem({
        Key: key,
        TableName: commonConfig.ORDER_TABLE,
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
    if (!item?.Item) {
      Logger.error(`[ERROR] - Item does not exist! [orderId: ${orderId}]`);
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `Item does not exist! [orderId: ${orderId}]`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return plainToClass(
      FindOneResponse,
      AWS.DynamoDB.Converter.unmarshall(item?.Item),
    );
  }
}
