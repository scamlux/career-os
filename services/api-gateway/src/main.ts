import { bootstrapHttpService } from '@careeros/shared';
import { ApiGatewayModule } from './api_gateway.module';

async function main(): Promise<void> {
  await bootstrapHttpService({
    serviceName: 'api-gateway',
    moduleRef: ApiGatewayModule
  });
}

void main();
