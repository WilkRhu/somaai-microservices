import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ImageUploadService {
  private readonly logger = new Logger(ImageUploadService.name);
  private uploadServiceUrl = process.env.UPLOAD_SERVICE_URL || 'http://upload:3008';

  async uploadProfileImage(base64: string, userId: string): Promise<string> {
    if (!base64) {
      return null;
    }

    try {
      this.logger.debug(`Uploading profile image for user ${userId}`);
      const response = await axios.post(`${this.uploadServiceUrl}/upload`, {
        base64,
        folder: 'users',
        fileName: `profile-${userId}`,
      });

      this.logger.debug(`Profile image uploaded: ${response.data.url}`);
      return response.data.url;
    } catch (error) {
      this.logger.error(
        `Failed to upload profile image: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to upload profile image: ${error.message}`);
    }
  }
}
