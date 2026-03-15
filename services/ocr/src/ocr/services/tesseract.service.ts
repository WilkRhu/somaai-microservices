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
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const data: Record<string, any> = {
      items: [],
      total: 0,
      productName: '',
    };

    let totalFound = false;
    const prices: number[] = [];

    // Extract product name from first non-empty line
    if (lines.length > 0) {
      data.productName = lines[0].trim();
    }

    for (const line of lines) {
      // Extract CNPJ
      if (line.includes('CNPJ')) {
        const cnpj = line.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/);
        if (cnpj) data.cnpj = cnpj[0];
      }

      // Extract all prices
      const priceMatches = line.match(/R\$\s*([\d.,]+)/g);
      if (priceMatches) {
        for (const match of priceMatches) {
          const priceStr = match.replace('R$', '').trim();
          const price = parseFloat(priceStr.replace('.', '').replace(',', '.'));
          if (!isNaN(price)) {
            prices.push(price);
          }
        }
      }

      // Extract total
      if (line.toUpperCase().includes('TOTAL')) {
        const total = line.match(/R\$\s*([\d.,]+)/);
        if (total) {
          data.total = parseFloat(total[1].replace('.', '').replace(',', '.'));
          totalFound = true;
        }
      }

      // Extract date
      if (line.match(/\d{2}\/\d{2}\/\d{4}/)) {
        const date = line.match(/\d{2}\/\d{2}\/\d{4}/);
        if (date) data.date = date[0];
      }
    }

    // If no total found, use the last price
    if (!totalFound && prices.length > 0) {
      data.total = prices[prices.length - 1];
    }

    if (prices.length > 0) {
      data.items = prices.map((price, index) => ({
        name: `Item ${index + 1}`,
        price: price,
      }));
    }

    return data;
  }

  private parseReceipt(text: string): Record<string, any> {
    // Simple parsing logic for receipts
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const data: Record<string, any> = {
      items: [],
      total: 0,
      productName: '',
    };

    let totalFound = false;
    const prices: number[] = [];

    // Extract product name from first non-empty line
    if (lines.length > 0) {
      data.productName = lines[0].trim();
      this.logger.log(`📝 Product Name extracted: ${data.productName}`);
    }

    for (const line of lines) {
      // Extract all prices in format R$X,XX or R$ X,XX
      const priceMatches = line.match(/R\$\s*([\d.,]+)/g);
      if (priceMatches) {
        for (const match of priceMatches) {
          const priceStr = match.replace('R$', '').trim();
          const price = parseFloat(priceStr.replace('.', '').replace(',', '.'));
          if (!isNaN(price)) {
            prices.push(price);
          }
        }
      }

      // Extract total (look for "Total" keyword)
      if (line.toUpperCase().includes('TOTAL')) {
        const total = line.match(/R\$\s*([\d.,]+)/);
        if (total) {
          data.total = parseFloat(total[1].replace('.', '').replace(',', '.'));
          totalFound = true;
        }
      }

      // Extract date
      if (line.match(/\d{2}\/\d{2}\/\d{4}/)) {
        const date = line.match(/\d{2}\/\d{2}\/\d{4}/);
        if (date) data.date = date[0];
      }
    }

    // If no total found with "Total" keyword, use the last price as total
    if (!totalFound && prices.length > 0) {
      data.total = prices[prices.length - 1];
      this.logger.log(`📝 No "Total" keyword found. Using last price as total: ${data.total}`);
    }

    // Extract items from prices
    if (prices.length > 0) {
      data.items = prices.map((price, index) => ({
        name: `Item ${index + 1}`,
        price: price,
      }));
    }

    this.logger.log(`🔍 RECEIPT PARSING RESULT:`);
    this.logger.log(`   - Product Name: ${data.productName}`);
    this.logger.log(`   - Total: ${data.total}`);
    this.logger.log(`   - Prices found: ${prices.length}`);
    this.logger.log(`   - Items: ${JSON.stringify(data.items)}`);

    return data;
  }

  private parseInvoice(text: string): Record<string, any> {
    // Simple parsing logic for invoices
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const data: Record<string, any> = {
      items: [],
      total: 0,
      productName: '',
    };

    let totalFound = false;
    const prices: number[] = [];

    // Extract product name from first non-empty line
    if (lines.length > 0) {
      data.productName = lines[0].trim();
    }

    for (const line of lines) {
      // Extract invoice number
      if (line.includes('Invoice') || line.includes('NF')) {
        const number = line.match(/\d+/);
        if (number) data.invoiceNumber = number[0];
      }

      // Extract all prices
      const priceMatches = line.match(/R\$\s*([\d.,]+)/g);
      if (priceMatches) {
        for (const match of priceMatches) {
          const priceStr = match.replace('R$', '').trim();
          const price = parseFloat(priceStr.replace('.', '').replace(',', '.'));
          if (!isNaN(price)) {
            prices.push(price);
          }
        }
      }

      // Extract total
      if (line.toUpperCase().includes('TOTAL')) {
        const total = line.match(/R\$\s*([\d.,]+)/);
        if (total) {
          data.total = parseFloat(total[1].replace('.', '').replace(',', '.'));
          totalFound = true;
        }
      }

      // Extract date
      if (line.match(/\d{2}\/\d{2}\/\d{4}/)) {
        const date = line.match(/\d{2}\/\d{2}\/\d{4}/);
        if (date) data.date = date[0];
      }
    }

    // If no total found, use the last price
    if (!totalFound && prices.length > 0) {
      data.total = prices[prices.length - 1];
    }

    if (prices.length > 0) {
      data.items = prices.map((price, index) => ({
        name: `Item ${index + 1}`,
        price: price,
      }));
    }

    return data;
  }
}
