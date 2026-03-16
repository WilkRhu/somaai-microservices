"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmailFooter = getEmailFooter;
function getEmailFooter() {
    return `
    <!-- Footer -->
    <div style="background-color: #2c3e50; color: #ecf0f1; padding: 30px 20px; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto;">
        <!-- Company Info -->
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #3498db;">SomaAI</h3>
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #bdc3c7;">
            Sua plataforma inteligente de gestão financeira
          </p>
        </div>
        
        <!-- Contact Info -->
        <div style="margin-bottom: 20px; padding: 15px 0; border-top: 1px solid #34495e; border-bottom: 1px solid #34495e;">
          <p style="margin: 0; font-size: 13px; color: #95a5a6;">
            📧 suporte@somaaiapp.com.br | 📱 (11) 9999-9999
          </p>
          <p style="margin: 5px 0 0 0; font-size: 13px; color: #95a5a6;">
            🌐 www.somaaiapp.com.br
          </p>
        </div>
        
        <!-- Legal -->
        <div>
          <p style="margin: 0; font-size: 12px; color: #7f8c8d; line-height: 1.4;">
            © ${new Date().getFullYear()} SomaAI. Todos os direitos reservados.<br>
            Este é um email automático, não responda diretamente.
          </p>
        </div>
      </div>
    </div>
  `;
}
//# sourceMappingURL=footer.template.js.map