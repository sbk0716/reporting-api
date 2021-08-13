/**
 * the entry point for local machine
 */
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import App Root Module
import { AppModule } from './app.module';
import { commonConfig } from './configs/common';
import Fastify from 'fastify';

// https://getpino.io/#/docs/api?id=loggerlevel-string-gettersetter
const fastifyInstance = Fastify({
  logger: { level: 'info' },
});
fastifyInstance.addHook('onRoute', (opts) => {
  if (opts.path === '/api/status') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    opts.logLevel = 'silent';
  }
});

/**
 * bootstrapを定義する
 * create()の引数に、AppModuleを指定して、NestApplication(HttpServer)をStartする
 */
async function bootstrap() {
  // create an instance of NestApplication with the specified httpAdapter(FastifyAdapter)
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(fastifyInstance),
  );
  // Set Global prefix
  // - https://docs.nestjs.com/faq/global-prefix
  app.setGlobalPrefix('api');

  // Define swagger document
  const config = new DocumentBuilder()
    .setTitle('Reporting API')
    .setDescription('Reporting API')
    .setVersion('1.0.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
      'access-key',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  /**
   * Fastifyの場合、DefaulではLocalHost(127.0.0.1)からのHTTP Requestしか許可していない。
   * そのため、default route(0.0.0.0)を追加して、他のHost(IP Address)からのHTTP RequestをReceiveできるようにする必要がある。
   * {@link https://www.fastify.io/docs/latest/Server/#listen}
   */
  await app.listen(commonConfig.API_PORT, '0.0.0.0');
}
// bootstrapを実行してNestApplication(HttpServer)をStartする
bootstrap();
