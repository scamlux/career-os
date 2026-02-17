"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveProtoPath = resolveProtoPath;
const fs = require("fs");
const path = require("path");
function resolveProtoPath(protoFileName) {
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
//# sourceMappingURL=proto-path.js.map