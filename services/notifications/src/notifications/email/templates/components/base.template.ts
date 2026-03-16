import { getEmailHeader } from './header.template';
import { getEmailFooter } from './footer.template';

export interface EmailTemplateOptions {
  title?: string;
  headerTitle?: string;
}

export function getBaseEmailTemplate(content: string, options: EmailTemplateOptions = {}): string {
  const { title = 'SomaAI', headerTitle } = options;
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f8fafc;
          line-height: 1.6;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .content-section {
          padding: 40px 30px;
        }
        
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          transition: transform 0.2s ease;
        }
        
        .button:hover {
          transform: translateY(-1px);
        }
        
        .alert {
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
        }
        
        .alert-info {
          background-color: #e3f2fd;
          border-left: 4px solid #2196f3;
          color: #1565c0;
        }
        
        .alert-warning {
          background-color: #fff3e0;
          border-left: 4px solid #ff9800;
          color: #e65100;
        }
        
        .alert-success {
          background-color: #e8f5e8;
          border-left: 4px solid #4caf50;
          color: #2e7d32;
        }
        
        @media only screen and (max-width: 600px) {
          .content-section {
            padding: 30px 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        ${getEmailHeader(headerTitle || title)}
        
        <div class="content-section">
          ${content}
        </div>
        
        ${getEmailFooter()}
      </div>
    </body>
    </html>
  `;
}