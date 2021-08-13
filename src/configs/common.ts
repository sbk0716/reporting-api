export const commonConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_PORT: process.env.API_PORT || 63000,
  REGION: process.env.REGION || 'ap-northeast-1',
  REPORTING_BUCKET: process.env.REPORTING_BUCKET || 'stg-gw-reporting-file',
  ORDER_TABLE: process.env.ORDER_TABLE || 'stg_reporting_orders',
  FONT_FILE_PATH: process.env.FONT_FILE_PATH || 'assets/Meiryo.ttf',
  S3_TEMPLATE_PREFIX: process.env.S3_TEMPLATE_PREFIX || 'report-template',
};
