import 'reflect-metadata';
type BootstrapOptions = {
    serviceName: string;
    moduleRef: unknown;
    protoFile: string;
    grpcPackage: string;
    grpcUrl?: string;
};
export declare function bootstrapHybridService(options: BootstrapOptions): Promise<void>;
type HttpBootstrapOptions = {
    serviceName: string;
    moduleRef: unknown;
};
export declare function bootstrapHttpService(options: HttpBootstrapOptions): Promise<void>;
export {};
