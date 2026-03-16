import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class KafkaService implements OnModuleInit, OnModuleDestroy {
    private kafka;
    private producer;
    private consumer;
    private readonly logger;
    private topicCallbacks;
    private isInitialized;
    private initializationPromise;
    constructor();
    onModuleInit(): Promise<void>;
    private initialize;
    onModuleDestroy(): Promise<void>;
    publishEvent(topic: string, message: any): Promise<void>;
    private isConsumerRunning;
    private subscriptionPromise;
    subscribeToTopic(topic: string, callback: (message: any) => Promise<void>): Promise<void>;
    private startConsumer;
}
//# sourceMappingURL=kafka.service.d.ts.map