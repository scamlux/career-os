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
var PostgresService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const pg_1 = require("pg");
let PostgresService = PostgresService_1 = class PostgresService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PostgresService_1.name);
    }
    async onModuleInit() {
        const connectionString = this.configService.getOrThrow('DATABASE_URL');
        this.pool = new pg_1.Pool({ connectionString, max: 20, idleTimeoutMillis: 30000 });
        await this.pool.query('SELECT 1');
        this.logger.log('PostgreSQL connection established');
    }
    async onModuleDestroy() {
        if (this.pool) {
            await this.pool.end();
        }
    }
    async query(sql, params = []) {
        if (!this.pool) {
            throw new Error('PostgreSQL pool is not initialized');
        }
        return this.pool.query(sql, params);
    }
};
exports.PostgresService = PostgresService;
exports.PostgresService = PostgresService = PostgresService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PostgresService);
//# sourceMappingURL=postgres.service.js.map