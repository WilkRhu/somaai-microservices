export class NfceResponseDto {
  id: string;
  establishmentId: string;
  number: number;
  series: number;
  totalValue: number;
  status: string;
  protocolNumber?: string;
  authorizationCode?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
