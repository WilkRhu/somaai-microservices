"use strict";
/**
 * Template para envio de Nota Fiscal Eletrônica por email
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFiscalNoteEmailTemplate = getFiscalNoteEmailTemplate;
exports.getFiscalNoteRejectedTemplate = getFiscalNoteRejectedTemplate;
function getFiscalNoteEmailTemplate(data, includeXmlAttachment = true) {
    const formattedDate = new Date(data.issueDate).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    const formattedTotal = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(data.total);
    const subject = `📄 Nota Fiscal ${data.noteNumber}/${data.series} - ${data.establishmentName}`;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 10px 0 0; opacity: 0.9; }
    .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
    .info-box { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding-bottom: 10px; border-bottom: 1px solid #e9ecef; }
    .info-row:last-child { border-bottom: none; padding-bottom: 0; }
    .info-label { color: #6c757d; font-size: 14px; }
    .info-value { font-weight: bold; color: #2c3e50; }
    .access-key { background: #e3f2fd; border: 1px solid #90caf9; border-radius: 5px; padding: 15px; text-align: center; margin: 20px 0; }
    .access-key-label { font-size: 12px; color: #1565c0; margin-bottom: 5px; }
    .access-key-value { font-family: monospace; font-size: 14px; color: #0d47a1; word-break: break-all; }
    .total-box { background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .total-label { font-size: 14px; opacity: 0.9; }
    .total-value { font-size: 32px; font-weight: bold; margin-top: 5px; }
    .button { display: inline-block; background: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .button:hover { background: #2980b9; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📄 Nota Fiscal Eletrônica</h1>
      <p>${data.establishmentName}</p>
    </div>
    
    <div class="content">
      <p>Olá <strong>${data.customerName}</strong>,</p>
      <p>Segue abaixo a Nota Fiscal Eletrônica da sua compra:</p>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Estabelecimento</span>
          <span class="info-value">${data.establishmentName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">CNPJ</span>
          <span class="info-value">${data.establishmentCnpj}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Número</span>
          <span class="info-value">${data.noteNumber} / ${data.series}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Data de Emissão</span>
          <span class="info-value">${formattedDate}</span>
        </div>
      </div>
      
      <div class="access-key">
        <div class="access-key-label">Chave de Acesso</div>
        <div class="access-key-value">${data.accessKey}</div>
      </div>
      
      <div class="total-box">
        <div class="total-label">Valor Total</div>
        <div class="total-value">${formattedTotal}</div>
      </div>
      
      <div class="warning">
        <strong>⚠️ Importante:</strong> Este é um email automático. Por favor, não responda. Para dúvidas, entre em contato diretamente com o estabelecimento.
      </div>
      
      <p style="text-align: center; color: #6c757d; font-size: 14px;">
        A nota fiscal em formato XML está anexada a este email.
      </p>
    </div>
    
    <div class="footer">
      <p>Este é um email automático, por favor não responda.</p>
      <p>&copy; ${new Date().getFullYear()} SomaAI Business. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
  `;
    return { subject, html };
}
/**
 * Template para notificação de rejeição de nota fiscal
 */
function getFiscalNoteRejectedTemplate(customerName, establishmentName, noteNumber, reason) {
    const subject = `⚠️ Problema com sua Nota Fiscal - ${establishmentName}`;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
    .warning-box { background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .reason-box { background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Nota Fiscal Rejeitada</h1>
      <p>${establishmentName}</p>
    </div>
    
    <div class="content">
      <p>Olá <strong>${customerName}</strong>,</p>
      <p>Infelizmente, houve um problema com a emissão da sua Nota Fiscal:</p>
      
      <div class="warning-box">
        <p><strong>Nota Fiscal:</strong> ${noteNumber}</p>
      </div>
      
      <div class="reason-box">
        <p><strong>Motivo da Rejeição:</strong></p>
        <p>${reason}</p>
      </div>
      
      <p>Por favor, entre em contato com o estabelecimento para que a nota seja corrigida e reemitida.</p>
    </div>
    
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} SomaAI Business.</p>
    </div>
  </div>
</body>
</html>
  `;
    return { subject, html };
}
//# sourceMappingURL=fiscal-note.template.js.map