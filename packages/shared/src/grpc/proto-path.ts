import * as fs from 'fs';
import * as path from 'path';

export function resolveProtoPath(protoFileName: string): string {
  const candidates = [
    path.resolve(process.cwd(), 'contracts/grpc', protoFileName),
    path.resolve(process.cwd(), '../../contracts/grpc', protoFileName),
    path.resolve(__dirname, '../../../../contracts/grpc', protoFileName),
    path.resolve(__dirname, '../../../contracts/grpc', protoFileName)
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Proto file not found: ${protoFileName}`);
}
