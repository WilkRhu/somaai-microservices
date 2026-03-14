import { Injectable, Logger } from '@nestjs/common';
import Tesseract from 'tesseract.js';

@Injectable()
export class TesseractService {
  private readonly logger = new Logger(TesseractService.name);

  async extractText(imageBuffer: Buffer, language: string = 'por'): Promise<{
    text: string;
    confidence: number;
  }> {
    try {
      this.logger.debug(`Starting OCR processing with language: ${language}`);

      // Tesseract.js pode precisar baixar modelos na primeira execução
      const result = await Tesseract.recognize(imageBuffer, language, {
        logger: (m) => {
          if (m.status === 'recognizing') {
            this.logger.debug(`Tesseract progress: ${(m.progress * 100).toFixed(2)}%`);
          }
        },
      });

      const text = result.data.text || '';
      const confidence = result.data.confidence || 0;

      this.logger.debug(`OCR completed. Confidence: ${confidence}%`);

      return {
        text,
        confidence: confidence / 100, // Convert to 0-1 range
      };
    } catch (error) {
      this.logger.error(`OCR processing failed: ${error.message}`);
      throw new Error(`OCR extraction failed: ${error.message}`);
    }
  }

  async extractStructuredData(
    imageBuffer: Buffer,
    documentType: string,
    language: string = 'por',
  ): Promise<Record<string, any>> {
    const { text } = await this.extractText(imageBuffer, language);

    // Parse based on document type
    switch (documentType.toLowerCase()) {
      case 'nfce':
        return this.parseNfce(text);
      case 'receipt':
        return this.parseReceipt(text);
      case 'invoice':
        return this.parseInvoice(text);
      default:
        return { rawText: text };
    }
  }

  private parseNfce(text: string): Record<string, any> {
    // Simple parsing logic for NFC-e
    const lines = text.split('\n');
    const data: Record<string, any> = {
      items: [],
      total: 0,
    };

    for (const line of lines) {
      // Extract CNPJ
      if (line.includes('CNPJ')) {
        const cnpj = line.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/);
        if (cnpj) data.cnpj = cnpj[0];
      }

      // Extract total
      if (line.includes('Total') || line.includes('TOTAL')) {
        const total = line.match(/R\$\s*([\d.,]+)/);
        if (total) data.total = parseFloat(total[1].replace('.', '').replace(',', '.'));
      }

      // Extract date
      if (line.match(/\d{2}\/\d{2}\/\d{4}/)) {
        const date = line.match(/\d{2}\/\d{2}\/\d{4}/);
        if (date) data.date = date[0];
      }
    }

    return data;
  }

  private parseReceipt(text: string): Record<string, any> {
    // Simple parsing logic for receipts
    const lines = text.split('\n');
    const data: Record<string, any> = {
      items: [],
      total: 0,
    };

    for (const line of lines) {
      // Extract total
      if (line.includes('Total') || line.includes('TOTAL')) {
        const total = line.match(/R\$\s*([\d.,]+)/);
        if (total) data.total = parseFloat(total[1].replace('.', '').replace(',', '.'));
      }

      // Extract date
      if (line.match(/\d{2}\/\d{2}\/\d{4}/)) {
        const date = line.match(/\d{2}\/\d{2}\/\d{4}/);
        if (date) data.date = date[0];
      }
    }

    return data;
  }

  private parseInvoice(text: string): Record<string, any> {
    // Simple parsing logic for invoices
    const lines = text.split('\n');
    const data: Record<string, any> = {
      items: [],
      total: 0,
    };

    for (const line of lines) {
      // Extract invoice number
      if (line.includes('Invoice') || line.includes('NF')) {
        const number = line.match(/\d+/);
        if (number) data.invoiceNumber = number[0];
      }

      // Extract total
      if (line.includes('Total') || line.includes('TOTAL')) {
        const total = line.match(/R\$\s*([\d.,]+)/);
        if (total) data.total = parseFloat(total[1].replace('.', '').replace(',', '.'));
      }
    }

    return data;
  }
}
