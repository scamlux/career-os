import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { resolveProtoPath } from '../grpc/proto-path';
import { RequestLoggingInterceptor } from '../observability/request-logging.interceptor';

type BootstrapOptions = {
  serviceName: string;
  moduleRef: unknown;
  protoFile: string;
  grpcPackage: string;
  grpcUrl?: string;
};

export async function bootstrapHybridService(options: BootstrapOptions): Promise<void> {
  const app = await NestFactory.create(options.moduleRef as any);
  const config = app.get(ConfigService);

  const httpPort = config.getOrThrow<number>('HTTP_PORT');
  const grpcPort = config.getOrThrow<number>('GRPC_PORT');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true
    })
  );

  app.useGlobalInterceptors(new RequestLoggingInterceptor(options.serviceName));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: options.grpcPackage,
      protoPath: resolveProtoPath(options.protoFile),
      url: options.grpcUrl ?? `0.0.0.0:${grpcPort}`,
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
      }
    }
  });

  await app.startAllMicroservices();
  await app.listen(httpPort);
}

type HttpBootstrapOptions = {
  serviceName: string;
  moduleRef: unknown;
};

export async function bootstrapHttpService(options: HttpBootstrapOptions): Promise<void> {
  const app = await NestFactory.create(options.moduleRef as any);
  const config = app.get(ConfigService);
  const httpPort = config.getOrThrow<number>('HTTP_PORT');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true
    })
  );

  app.useGlobalInterceptors(new RequestLoggingInterceptor(options.serviceName));

  await app.listen(httpPort);
}
