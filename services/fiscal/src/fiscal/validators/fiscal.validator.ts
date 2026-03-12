import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { NfceStatus } from '../entities/nfce.entity';
import { existsSync } from 'fs';

@Injectable()
export class FiscalValidator {
  validateCertificate(certificatePath: string): boolean {
    if (!certificatePath || certificatePath.trim().length === 0) {
      throw new HttpException(
        'Certificate path is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!existsSync(certificatePath)) {
      throw new HttpException(
        `Certificate file not found: ${certificatePath}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!certificatePath.endsWith('.pfx') && !certificatePath.endsWith('.p12')) {
      throw new HttpException(
        'Certificate must be in PFX or P12 format',
        HttpStatus.BAD_REQUEST,
      );
    }

    return true;
  }

  validateNfceStatus(status: NfceStatus, requiredStatus: NfceStatus): boolean {
    if (status !== requiredStatus) {
      throw new HttpException(
        `NFC-e must be in ${requiredStatus} status, current status: ${status}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return true;
  }

  validateCancellationReason(reason: string): boolean {
    if (!reason || reason.trim().length < 15) {
      throw new HttpException(
        'Cancellation reason must be at least 15 characters',
        HttpStatus.BAD_REQUEST,
      );
    }

    return true;
  }

  validateNfceNumber(number: number): boolean {
    if (number <= 0) {
      throw new HttpException(
        'NFC-e number must be greater than 0',
        HttpStatus.BAD_REQUEST,
      );
    }

    return true;
  }

  validateNfceSeries(series: number): boolean {
    if (series <= 0) {
      throw new HttpException(
        'NFC-e series must be greater than 0',
        HttpStatus.BAD_REQUEST,
      );
    }

    return true;
  }

  validateNfceValue(value: number): boolean {
    if (value <= 0) {
      throw new HttpException(
        'NFC-e value must be greater than 0',
        HttpStatus.BAD_REQUEST,
      );
    }

    return true;
  }
}
