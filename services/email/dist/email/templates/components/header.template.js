"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmailHeader = getEmailHeader;
function getEmailHeader(title = 'SomaAI') {
    return `
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto;">
        <!-- Logo -->
        <div style="margin-bottom: 20px;">
          <img src="https://somaaiuploads.s3.us-east-1.amazonaws.com/logomarca/logotipo.png" alt="SomaAI Logo" style="height: 50px; width: auto;" />
        </div>
        
        <!-- Title -->
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
          ${title}
        </h1>
      </div>
    </div>
  `;
}
//# sourceMappingURL=header.template.js.map