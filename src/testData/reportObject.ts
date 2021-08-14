import { testOrderItem } from './orderItem';
import { testConfig } from './config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

const testObject = { key1: 'value1', key2: 'value2', key3: 'value3' };
// Use a test data converted from a string to a buffer
const buffer = Buffer.from(JSON.stringify(testObject));
const datetime = new Date('2021-01-01').toISOString();
const prefix = `report/${testOrderItem.orderId}/${datetime}`;
const fileName = 'sample.json';
const key = `${prefix}/${fileName}`;

export const testObjectUploadParams = {
  Body: buffer,
  Key: key,
};

export const testObjectInfo = {
  buffer,
  fileName,
  prefix,
  key,
};

const templateName = 'zaisekisyoumeisyo';
const templateFileName = `${templateName}.mrt`;
const templatePrefix = `${testConfig.S3_TEMPLATE_PREFIX}`;
const templateKey = `${templatePrefix}/${templateFileName}`;
const fileContent = fs.readFileSync(`./src/testData/${templateName}.mrt`, {
  encoding: 'utf8',
  flag: 'r',
});

export const testTemplateInfo = {
  templateName,
  templateFileName,
  templatePrefix,
  templateKey,
};

export const testTemplateUploadParams = {
  Body: fileContent,
  Key: templateKey,
};
