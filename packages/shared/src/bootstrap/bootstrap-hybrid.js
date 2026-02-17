"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapHybridService = bootstrapHybridService;
exports.bootstrapHttpService = bootstrapHttpService;
require("reflect-metadata");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const microservices_1 = require("@nestjs/microservices");
const proto_path_1 = require("../grpc/proto-path");
const request_logging_interceptor_1 = require("../observability/request-logging.interceptor");
async function bootstrapHybridService(options) {
    const app = await core_1.NestFactory.create(options.moduleRef);
    const config = app.get(config_1.ConfigService);
    const httpPort = config.getOrThrow('HTTP_PORT');
    const grpcPort = config.getOrThrow('GRPC_PORT');
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true
    }));
    app.useGlobalInterceptors(new request_logging_interceptor_1.RequestLoggingInterceptor(options.serviceName));
    app.connectMicroservice({
        transport: microservices_1.Transport.GRPC,
        options: {
            package: options.grpcPackage,
            protoPath: (0, proto_path_1.resolveProtoPath)(options.protoFile),
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
async function bootstrapHttpService(options) {
    const app = await core_1.NestFactory.create(options.moduleRef);
    const config = app.get(config_1.ConfigService);
    const httpPort = config.getOrThrow('HTTP_PORT');
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true
    }));
    app.useGlobalInterceptors(new request_logging_interceptor_1.RequestLoggingInterceptor(options.serviceName));
    await app.listen(httpPort);
}
//# sourceMappingURL=bootstrap-hybrid.js.map