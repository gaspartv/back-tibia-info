import fastifyCookie from '@fastify/cookie'
import helmet from '@fastify/helmet'
import { ValidationPipe } from '@nestjs/common'
import { NestInterceptor } from '@nestjs/common/interfaces/features/nest-interceptor.interface'
import { Logger } from '@nestjs/common/services/logger.service'
import { NestFactory } from '@nestjs/core/nest-factory'
import { FastifyAdapter } from '@nestjs/platform-fastify/adapters/fastify-adapter'
import { NestFastifyApplication } from '@nestjs/platform-fastify/interfaces/nest-fastify-application.interface'
import fileUpload from 'fastify-file-upload'
import { join } from 'path'
import { AppModule } from './app.module'
import { TransformationInterceptor } from './config/global-interceptor'
import { PrismaClientExceptionFilter } from './config/prisma/prisma.exception'
import { documentBuilder } from './config/swagger/document-builder'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  )

  /// TRATAMENTO DO CORS ///
  app.enableCors()

  /// PROTEÇÃO PARA O CABEÇALHO DA APLICAÇÃO ///
  await app.register(helmet)

  app.register(fileUpload, {
    limits: { fileSize: 1024 * 1024 * 5 },
    useTempFiles: true,
    tempFileDir: 'tmp/trash',
    createParentPath: true,
    uriDecodeFileNames: true,
    safeFileNames: '/.(jpg|jpeg|png)$/i',
    preserveExtension: true
  })

  // COOKIE
  await app.register(fastifyCookie, { secret: 'api-tibia-info' })

  /// VALIDAÇÃO ///
  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: 422,
      whitelist: true,
      transform: true,
      transformOptions: { groups: ['transform'] }
    })
  )

  const httpAdapter = app.getHttpAdapter()

  /// GLOBAL INTERCEPTORS ///
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter))
  app.useGlobalInterceptors(new TransformationInterceptor<NestInterceptor>())

  /// DOCUMENTAÇÃO ///
  documentBuilder(app)

  app.useStaticAssets({ root: join(__dirname, '..') })

  await app.listen(Number(process.env.PORT_BACKEND), '0.0.0.0', () =>
    Logger.log(`> Server start in port ${Number(process.env.PORT_BACKEND)}`)
  )
}
bootstrap()
