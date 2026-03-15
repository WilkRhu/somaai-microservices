import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

export interface PushOptions {
  deviceToken: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class PushProvider {
  private readonly logger = new Logger(PushProvider.name);
  private app: admin.app.App | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      if (!process.env.FIREBASE_PROJECT_ID) {
        this.logger.warn('Firebase credentials not configured. Push notifications will be disabled.');
        this.isInitialized = false;
        return;
      }

      if (!admin.apps.length) {
        this.app = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          } as admin.ServiceAccount),
        });
      } else {
        this.app = admin.app();
      }
      this.isInitialized = true;
    } catch (error) {
      this.logger.error('Failed to initialize Firebase:', error);
      this.isInitialized = false;
    }
  }

  async send(options: PushOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'Firebase not initialized. Push notifications are disabled.',
      };
    }

    try {
      const message: admin.messaging.Message = {
        notification: {
          title: options.title,
          body: options.body,
        },
        data: options.data || {},
        token: options.deviceToken,
      };

      const messageId = await admin.messaging().send(message);
      this.logger.log(`Push notification sent to device, messageId: ${messageId}`);
      return { success: true, messageId };
    } catch (error) {
      this.logger.error(`Failed to send push notification:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendMulticast(
    deviceTokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<{ success: number; failure: number; errors: string[] }> {
    if (!this.isInitialized) {
      return {
        success: 0,
        failure: deviceTokens.length,
        errors: ['Firebase not initialized. Push notifications are disabled.'],
      };
    }

    try {
      const message: admin.messaging.MulticastMessage = {
        notification: {
          title,
          body,
        },
        data: data || {},
        tokens: deviceTokens,
      };

      const response = await (admin.messaging() as any).sendAll(message);
      this.logger.log(`Push notifications sent: ${response.successCount} success, ${response.failureCount} failed`);

      return {
        success: response.successCount,
        failure: response.failureCount,
        errors: response.responses
          .map((r: any, i: number) => (!r.success ? `Token ${i}: ${r.error?.message}` : null))
          .filter((e: any) => e !== null) as string[],
      };
    } catch (error) {
      this.logger.error(`Failed to send multicast push notifications:`, error);
      return {
        success: 0,
        failure: deviceTokens.length,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }
}
