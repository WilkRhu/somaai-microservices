#!/usr/bin/env node

/**
 * Script para enviar email direto via SMTP usando nodemailer
 * Não precisa do serviço de notificações rodando
 * 
 * Uso: node scripts/send-email-direct.js
 */

const nodemailer = require('nodemailer');

const EMAIL_TO = 'wilk.caetano@gmail.com';
const EMAIL_FROM = 'somaai@wilkcaetano.com.br';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.hostinger.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465');
const SMTP_USER = process.env.SMTP_USER || 'somaai@wilkcaetano.com.br';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

// Cores para console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
};

async function sendEmail() {
  console.log('');
  log.info('Enviando email direto via SMTP...');
  console.log('');

  if (!SMTP_PASSWORD) {
    log.error('Variável de ambiente SMTP_PASSWORD não definida');
    console.log('');
    log.warn('Configure a senha SMTP:');
    console.log(`  ${colors.cyan}export SMTP_PASSWORD="sua-senha-aqui"${colors.reset}`);
    console.log(`  ${colors.cyan}node scripts/send-email-direct.js${colors.reset}`);
    process.exit(1);
  }

  try {
    // Criar transportador SMTP
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true para 465, false para outras portas
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });

    // Verificar conexão
    log.info('Verificando conexão SMTP...');
    await transporter.verify();
    log.success('Conexão SMTP verificada');
    console.log('');

    // Preparar email
    const mailOptions = {
      from: EMAIL_FROM,
      to: EMAIL_TO,
      subject: 'Teste de Email - Sistema de Notificações',
      html: `
        <h2>Olá Wilk Caetano,</h2>
        <p>Este é um email de teste do sistema de notificações <strong>SomaAI</strong>.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><a href="https://example.com/activate/test-123">Link de ativação</a></p>
        <hr>
        <p><small>SomaAI - Sistema de Notificações</small></p>
      `,
      text: `
Olá Wilk Caetano,

Este é um email de teste do sistema de notificações SomaAI.

Timestamp: ${new Date().toISOString()}

Link de ativação: https://example.com/activate/test-123

---
SomaAI - Sistema de Notificações
      `,
    };

    // Enviar email
    console.log(`${colors.yellow}📤 Enviando para: ${EMAIL_TO}${colors.reset}`);
    console.log(`${colors.yellow}📝 Assunto: ${mailOptions.subject}${colors.reset}`);
    console.log(`${colors.yellow}📧 De: ${EMAIL_FROM}${colors.reset}`);
    console.log('');

    const info = await transporter.sendMail(mailOptions);

    log.success('Email enviado com sucesso!');
    console.log('');
    console.log(`${colors.cyan}📋 ID da mensagem: ${info.messageId}${colors.reset}`);
    console.log(`${colors.cyan}Verifique sua caixa de entrada em: ${EMAIL_TO}${colors.reset}`);
    console.log('');
  } catch (error) {
    log.error(`Erro ao enviar email: ${error.message}`);
    console.log('');
    log.warn('Possíveis causas:');
    console.log('  1. Senha SMTP incorreta');
    console.log('  2. Servidor SMTP indisponível');
    console.log('  3. Firewall bloqueando a porta 465');
    console.log('  4. Credenciais inválidas');
    console.log('');
    process.exit(1);
  }
}

sendEmail();
