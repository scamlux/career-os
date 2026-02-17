"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestLoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
let RequestLoggingInterceptor = class RequestLoggingInterceptor {
    constructor(serviceName) {
        this.serviceName = serviceName;
        this.logger = new common_1.Logger(serviceName);
    }
    intercept(context, next) {
        const started = Date.now();
        const http = context.switchToHttp();
        const request = http.getRequest();
        if (request?.method && request?.url) {
            this.logger.log(`REQ ${request.method} ${request.url}`);
        }
        return next.handle().pipe((0, rxjs_1.tap)({
            next: () => {
                const elapsed = Date.now() - started;
                if (request?.method && request?.url) {
                    this.logger.log(`RES ${request.method} ${request.url} ${elapsed}ms`);
                }
            },
            error: (error) => {
                const elapsed = Date.now() - started;
                const message = error instanceof Error ? error.message : 'unknown error';
                this.logger.error(`ERR ${elapsed}ms ${message}`);
            }
        }));
    }
};
exports.RequestLoggingInterceptor = RequestLoggingInterceptor;
exports.RequestLoggingInterceptor = RequestLoggingInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [String])
], RequestLoggingInterceptor);
//# sourceMappingURL=request-logging.interceptor.js.map