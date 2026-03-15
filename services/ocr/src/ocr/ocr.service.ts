import { Injectable, Logger } from '@nestjs/common';
import { TesseractService } from './services/tesseract.service';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  constructor(private tesseractService: TesseractService) {}

  async extractBase64(body: any): Promise<any> {
    try {
      this.logger.debug(`Received extract request`);

      let imageBase64 = body?.imageBase64;
      if (!imageBase64) {
        throw new Error('Image data is required');
      }

      // Remove data URI prefix if present (e.g., "data:image/png;base64,")
      if (imageBase64.includes(',')) {
        imageBase64 = imageBase64.split(',')[1];
        this.logger.debug(`Removed data URI prefix from base64`);
      }

      // Convert base64 to buffer
      let imageBuffer: Buffer;
      try {
        imageBuffer = Buffer.from(imageBase64, 'base64');
        this.logger.debug(`Converted base64 to buffer, size: ${imageBuffer.length} bytes`);
      } catch (error) {
        throw new Error(`Invalid base64 image: ${error.message}`);
      }

      const language = body?.language || process.env.OCR_LANGUAGE || 'por';
      const documentType = body?.documentType || 'receipt';

      this.logger.debug(`Extracting OCR (type: ${documentType}, language: ${language})`);

      // Extract text
      const { text, confidence } = await this.tesseractService.extractText(
        imageBuffer,
        language,
      );

      // Extract structured data
      const extractedData = await this.tesseractService.extractStructuredData(
        imageBuffer,
        documentType,
        language,
      );

      this.logger.debug(`OCR completed with confidence: ${confidence}`);

      const response = {
        extractedData: {
          productName: extractedData.productName || extractedData.items?.[0]?.name || 'Unknown Product',
          price: extractedData.total || extractedData.mainValue?.value || 0,
          mainValue: {
            value: extractedData.total || extractedData.mainValue?.value || 0,
          },
          values: extractedData.items?.map((item: any) => ({
            value: item.price || item.unitPrice || 0,
          })) || [{ value: extractedData.total || 0 }],
          product: {
            productName: extractedData.productName || extractedData.items?.[0]?.name || 'Unknown Product',
          },
          descriptions: [
            {
              cleanText: text.substring(0, 100).trim(),
              text: text.substring(0, 100).trim(),
            },
          ],
          weight: extractedData.weight || 'N/A',
        },
        IsErroredOnProcessing: false,
        confidence,
        documentType,
      };

      this.logger.log(`📊 OCR SERVICE RESPONSE:`);
      this.logger.log(`   - Product: ${response.extractedData.productName}`);
      this.logger.log(`   - Price: ${response.extractedData.price}`);
      this.logger.log(`   - Confidence: ${confidence}`);
      this.logger.log(`   - Full Response:`, JSON.stringify(response, null, 2));

      return response;
    } catch (error) {
      this.logger.error(`Error extracting base64: ${error.message}`);
      throw error;
    }
  }
}
