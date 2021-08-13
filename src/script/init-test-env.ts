import { testOrderItem } from '../testData/orderItem';
import {
  testObjectUploadParams,
  testTemplateUploadParams,
} from '../testData/reportObject';
import { testConfig } from '../testData/config';
import { commonConfig } from '../configs/common';
import * as AWS from 'aws-sdk';

async function putItem(params): Promise<void> {
  const config = { region: commonConfig.REGION };
  if (commonConfig.NODE_ENV === 'development') {
    config['accessKeyId'] = process.env.ACCESS_KEY_ID;
    config['secretAccessKey'] = process.env.SECRET_ACCESS_KEY;
  }
  AWS.config.update(config);
  const tableName = testConfig.ORDER_TABLE;
  const orderId = params?.orderId;
  const dynamoDb = new AWS.DynamoDB();
  const parsedItem = AWS.DynamoDB.Converter.marshall(params);
  await dynamoDb
    .putItem({
      Item: parsedItem,
      TableName: tableName,
      ReturnValues: 'NONE',
    })
    .promise()
    .catch((err) => {
      console.error(`${err?.message}`);
      throw err;
    });
  const key = AWS.DynamoDB.Converter.marshall({ orderId });
  const item = await dynamoDb
    .getItem({
      Key: key,
      TableName: tableName,
    })
    .promise()
    .catch((err) => {
      console.error(`${err?.message}`);
      throw err;
    });
  const convertedItem = AWS.DynamoDB.Converter.unmarshall(item?.Item);
  console.log(
    `New item created successfully! [PartitionKey: ${convertedItem?.orderId}]`,
  );
}

async function upload(params): Promise<void> {
  const config = { region: commonConfig.REGION };
  if (commonConfig.NODE_ENV === 'development') {
    config['accessKeyId'] = process.env.ACCESS_KEY_ID;
    config['secretAccessKey'] = process.env.SECRET_ACCESS_KEY;
  }
  AWS.config.update(config);
  const { Body, Key } = params;
  const uploadParams = {
    Bucket: testConfig.REPORTING_BUCKET,
    Body,
    Key,
  };
  const sendData = await new AWS.S3.ManagedUpload({
    params: uploadParams,
  })
    .promise()
    .catch((err) => {
      console.error(`${err?.message}`);
      throw err;
    });
  console.log(
    `The file has been uploaded successfully! [Key: ${sendData?.Key}]`,
  );
}

const handler = async () => {
  console.log('########## [START] ##########');
  try {
    await upload(testTemplateUploadParams);
    await upload(testObjectUploadParams);
    await putItem(testOrderItem);
  } catch (err) {
    console.error(err);
  }
  console.log('########## [END] ##########');
};

handler();
