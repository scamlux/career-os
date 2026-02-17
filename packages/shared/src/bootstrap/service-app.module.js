"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceAppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const config_module_1 = require("../config/config.module");
const postgres_module_1 = require("../database/postgres.module");
const correlation_id_middleware_1 = require("../middleware/correlation-id.middleware");
const kafka_module_1 = require("../kafka/kafka.module");
let ServiceAppModule = class ServiceAppModule {
    configure(consumer) {
        consumer.apply(correlation_id_middleware_1.CorrelationIdMiddleware).forRoutes('*');
    }
};
exports.ServiceAppModule = ServiceAppModule;
exports.ServiceAppModule = ServiceAppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.SharedConfigModule,
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: Number(process.env.THROTTLE_TTL ?? 60),
                    limit: Number(process.env.THROTTLE_LIMIT ?? 120)
                }
            ]),
            postgres_module_1.PostgresModule,
            kafka_module_1.KafkaModule
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard
            }
        ],
        exports: [config_module_1.SharedConfigModule, throttler_1.ThrottlerModule, kafka_module_1.KafkaModule]
    })
], ServiceAppModule);
//# sourceMappingURL=service-app.module.js.map