/**
 * Template para envio de Nota Fiscal Eletrônica por email
 */
export interface FiscalNoteEmailData {
    customerName: string;
    establishmentName: string;
    establishmentCnpj: string;
    noteNumber: string;
    series: string;
    accessKey: string;
    issueDate: Date;
    total: number;
    customerEmail: string;
}
export declare function getFiscalNoteEmailTemplate(data: FiscalNoteEmailData, includeXmlAttachment?: boolean): {
    subject: string;
    html: string;
};
/**
 * Template para notificação de rejeição de nota fiscal
 */
export declare function getFiscalNoteRejectedTemplate(customerName: string, establishmentName: string, noteNumber: string, reason: string): {
    subject: string;
    html: string;
};
//# sourceMappingURL=fiscal-note.template.d.ts.map