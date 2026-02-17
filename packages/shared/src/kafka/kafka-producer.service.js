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
var KafkaProducerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaProducerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const kafkajs_1 = require("kafkajs");
let KafkaProducerService = KafkaProducerService_1 = class KafkaProducerService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(KafkaProducerService_1.name);
    }
    async onModuleInit() {
        const brokers = this.configService.getOrThrow('KAFKA_BROKERS').split(',');
        const clientId = this.configService.getOrThrow('KAFKA_CLIENT_ID');
        const kafka = new kafkajs_1.Kafka({ clientId, brokers });
        this.producer = kafka.producer();
        await this.producer.connect();
        this.logger.log('Kafka producer connected');
    }
    async onModuleDestroy() {
        if (this.producer) {
            await this.producer.disconnect();
        }
    }
    async publish(topic, envelope) {
        if (!this.producer) {
            throw new Error('Kafka producer is not initialized');
        }
        await this.producer.send({
            topic,
            messages: [
                {
                    key: envelope.tenant_id,
                    value: JSON.stringify(envelope),
                    headers: {
                        event_type: envelope.event_type,
                        event_version: envelope.event_version.toString()
                    }
                }
            ]
        });
    }
};
exports.KafkaProducerService = KafkaProducerService;
exports.KafkaProducerService = KafkaProducerService = KafkaProducerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], KafkaProducerService);
//# sourceMappingURL=kafka-producer.service.js.map