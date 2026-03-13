# Frontend Integration Guide

## Overview

Este documento descreve como integrar o frontend com os serviços backend da plataforma SomaAI.

## Architecture

```
Frontend (React/Vue/Angular)
    ↓
API Gateway / Load Balancer
    ↓
┌─────────────────────────────────────────────────────────────┐
│                    Microservices                             │
├─────────────────────────────────────────────────────────────┤
│ Auth Service │ Business │ Sales │ Inventory │ Payments │... │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│                    Databases                                 │
├─────────────────────────────────────────────────────────────┤
│ Auth DB │ Business DB │ Sales DB │ Inventory DB │ Payments DB
└─────────────────────────────────────────────────────────────┘
```

## Base URLs

### Development
```
Orchestrator (API Gateway): http://localhost:3009
```

### Production
```
API Gateway: https://api.somaai.com
```

### Internal Services (Backend Only)
```
Auth Service:       http://auth:3001
Business Service:   http://business:3002
Sales Service:      http://sales:3003
Inventory Service:  http://inventory:3004
Payments Service:   http://payments:3005
Fiscal Service:     http://fiscal:3006
OCR Service:        http://ocr:3007
Upload Service:     http://upload:3008
Email Service:      http://email:3010
```

## Authentication Flow

O fluxo de autenticação é gerenciado pelo Orchestrator que roteia para o Auth Service.

### 1. Login
```typescript
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin"
  }
}
```

### 2. Using Access Token
```typescript
GET /api/resource
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### 3. Refresh Token
```typescript
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

## API Endpoints

Todos os endpoints são acessados através do Orchestrator (http://localhost:3009). O Orchestrator roteia as requisições para os serviços apropriados.

### Authentication (via Orchestrator)

#### Login
```typescript
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin"
  }
}
```

#### Refresh Token
```typescript
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Business Service (via Orchestrator)
```typescript
POST /business
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "My Business",
  "cnpj": "12345678901234",
  "email": "business@example.com",
  "phone": "+5511999999999",
  "address": {
    "street": "Rua Example",
    "number": "123",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567"
  }
}

Response: 201 Created
{
  "id": "business-uuid",
  "name": "My Business",
  "cnpj": "12345678901234",
  "status": "active",
  "createdAt": "2026-03-12T10:00:00Z"
}
```

#### Get Business
```typescript
GET /business/{businessId}
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "business-uuid",
  "name": "My Business",
  "cnpj": "12345678901234",
  "email": "business@example.com",
  "phone": "+5511999999999",
  "status": "active",
  "createdAt": "2026-03-12T10:00:00Z",
  "updatedAt": "2026-03-12T10:00:00Z"
}
```

#### List Businesses
```typescript
GET /business?page=1&limit=10&status=active
Authorization: Bearer {token}

Response: 200 OK
{
  "data": [
    {
      "id": "business-uuid",
      "name": "My Business",
      "cnpj": "12345678901234",
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### Sales Service

#### Create Sale
```typescript
POST /sales
Authorization: Bearer {token}
Content-Type: application/json

{
  "businessId": "business-uuid",
  "customerId": "customer-uuid",
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 2,
      "unitPrice": 100.00
    }
  ],
  "paymentMethod": "credit_card",
  "totalAmount": 200.00
}

Response: 201 Created
{
  "id": "sale-uuid",
  "businessId": "business-uuid",
  "customerId": "customer-uuid",
  "totalAmount": 200.00,
  "status": "pending",
  "createdAt": "2026-03-12T10:00:00Z"
}
```

#### Get Sale
```typescript
GET /sales/{saleId}
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "sale-uuid",
  "businessId": "business-uuid",
  "customerId": "customer-uuid",
  "items": [...],
  "totalAmount": 200.00,
  "status": "completed",
  "createdAt": "2026-03-12T10:00:00Z"
}
```

### Inventory Service

#### Get Stock
```typescript
GET /inventory/{productId}
Authorization: Bearer {token}

Response: 200 OK
{
  "productId": "product-uuid",
  "quantity": 100,
  "reserved": 10,
  "available": 90,
  "lastUpdated": "2026-03-12T10:00:00Z"
}
```

#### Update Stock
```typescript
PATCH /inventory/{productId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 50,
  "operation": "set" // or "add", "subtract"
}

Response: 200 OK
{
  "productId": "product-uuid",
  "quantity": 50,
  "available": 40
}
```

### Payments Service

#### Process Payment
```typescript
POST /payments/process
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "order-uuid",
  "amount": 250.50,
  "paymentMethod": "credit_card",
  "customerEmail": "customer@example.com",
  "customerName": "Customer Name"
}

Response: 201 Created
{
  "id": "payment-uuid",
  "orderId": "order-uuid",
  "amount": 250.50,
  "status": "processing",
  "transactionId": "txn_123456",
  "createdAt": "2026-03-12T10:00:00Z"
}
```

#### Get Payment Status
```typescript
GET /payments/{paymentId}
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "payment-uuid",
  "orderId": "order-uuid",
  "amount": 250.50,
  "status": "completed",
  "transactionId": "txn_123456",
  "createdAt": "2026-03-12T10:00:00Z"
}
```

### Fiscal Service

#### Generate NFC-e
```typescript
POST /fiscal/nfce
Authorization: Bearer {token}
Content-Type: application/json

{
  "establishmentId": "establishment-uuid",
  "number": 1,
  "series": 1,
  "items": [
    {
      "code": "PROD001",
      "description": "Product 1",
      "quantity": 2,
      "unitPrice": 50.00,
      "totalPrice": 100.00
    }
  ],
  "totalValue": 100.00
}

Response: 201 Created
{
  "id": "nfce-uuid",
  "establishmentId": "establishment-uuid",
  "number": 1,
  "series": 1,
  "totalValue": 100.00,
  "status": "authorized",
  "protocolNumber": "123456789012345",
  "authorizationCode": "12345678901234567890123456789012345678901234",
  "createdAt": "2026-03-12T10:00:00Z"
}
```

### OCR Service

#### Process Image
```typescript
POST /ocr/process
Authorization: Bearer {token}
Content-Type: application/json

{
  "fileName": "invoice_2026_03_12.jpg",
  "documentType": "nfce",
  "imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "referenceId": "sale-uuid"
}

Response: 201 Created
{
  "id": "ocr-uuid",
  "fileName": "invoice_2026_03_12.jpg",
  "documentType": "nfce",
  "status": "processing",
  "createdAt": "2026-03-12T10:00:00Z"
}
```

#### Get OCR Result
```typescript
GET /ocr/{ocrId}
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "ocr-uuid",
  "fileName": "invoice_2026_03_12.jpg",
  "documentType": "nfce",
  "status": "completed",
  "extractedText": "NFC-e number: 123456, Date: 2026-03-12",
  "extractedData": {
    "nfceNumber": "123456",
    "date": "2026-03-12",
    "value": 100.00
  },
  "confidence": 0.95,
  "createdAt": "2026-03-12T10:00:00Z"
}
```

## Error Handling

### Standard Error Response
```typescript
{
  "statusCode": 400,
  "message": "Invalid request",
  "error": "Bad Request",
  "timestamp": "2026-03-12T10:00:00Z"
}
```

### Common Status Codes
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict
- `500 Internal Server Error` - Server error

## Frontend Implementation Examples

### React with Axios

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Login Hook
```typescript
import { useState } from 'react';
import api from './api';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data.user;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
```

### Upload Service Hook
```typescript
import { useState } from 'react';
import api from './api';

export const useUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (file: File, type: string, businessId?: string) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      if (businessId) {
        formData.append('businessId', businessId);
      }

      const { data } = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadBase64 = async (
    fileName: string,
    imageBase64: string,
    type: string,
    businessId?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/upload/image-base64', {
        fileName,
        imageBase64,
        type,
        businessId,
      });

      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { uploadImage, uploadBase64, loading, error, progress };
};
```

### Upload Component Example
```typescript
import React, { useState } from 'react';
import { useUpload } from './hooks/useUpload';

export const ImageUpload = ({ businessId, onUploadSuccess }) => {
  const { uploadImage, loading, error, progress } = useUpload();
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      const result = await uploadImage(file, 'product', businessId);
      onUploadSuccess(result);
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      <button onClick={handleUpload} disabled={loading || !file}>
        {loading ? `Uploading... ${progress}%` : 'Upload'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
```

## CORS Configuration

Frontend deve estar configurado para aceitar requisições CORS:

```typescript
// Backend CORS config (NestJS)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(3001);
}

bootstrap();
```

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3009
REACT_APP_API_TIMEOUT=30000
```

### Backend (.env)
```
# Orchestrator
ORCHESTRATOR_PORT=3009
CORS_ORIGIN=http://localhost:3000

# Internal Services URLs
AUTH_SERVICE_URL=http://auth:3001
BUSINESS_SERVICE_URL=http://business:3002
SALES_SERVICE_URL=http://sales:3003
INVENTORY_SERVICE_URL=http://inventory:3004
PAYMENTS_SERVICE_URL=http://payments:3005
FISCAL_SERVICE_URL=http://fiscal:3006
OCR_SERVICE_URL=http://ocr:3007
UPLOAD_SERVICE_URL=http://upload:3008
EMAIL_SERVICE_URL=http://email:3010

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=somaai-uploads

# FTP Fallback Configuration
FTP_HOST=backup.somaai.com
FTP_PORT=21
FTP_USER=ftp-user
FTP_PASSWORD=ftp-password
FTP_PATH=/uploads

# Email Configuration (SendGrid / SMTP)
EMAIL_PROVIDER=sendgrid # or smtp
SENDGRID_API_KEY=your-sendgrid-api-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@somaai.com
EMAIL_FROM_NAME=SomaAI

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h
```

## WebSocket Integration (Real-time Updates)

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3008', {
  auth: {
    token: localStorage.getItem('accessToken'),
  },
});

// Listen for real-time updates
socket.on('sale:created', (data) => {
  console.log('New sale:', data);
});

socket.on('payment:completed', (data) => {
  console.log('Payment completed:', data);
});

socket.on('nfce:authorized', (data) => {
  console.log('NFC-e authorized:', data);
});
```

## Testing

### Integration Tests
```typescript
import axios from 'axios';

describe('Frontend Integration', () => {
  const api = axios.create({
    baseURL: 'http://localhost:3001',
  });

  it('should login successfully', async () => {
    const response = await api.post('/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('accessToken');
  });

  it('should create a business', async () => {
    const token = 'test-token';
    const response = await api.post(
      '/business',
      {
        name: 'Test Business',
        cnpj: '12345678901234',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
  });
});
```

## Deployment

### Frontend Deployment
```bash
# Build
npm run build

# Deploy to Vercel, Netlify, or your hosting
vercel deploy
```

### Backend Deployment
```bash
# Docker build
docker build -t somaai-backend .

# Push to registry
docker push your-registry/somaai-backend

# Deploy to Kubernetes
kubectl apply -f deployment.yaml
```

## Support

Para suporte e dúvidas sobre integração:
- Email: support@somaai.com
- Documentação: https://docs.somaai.com
- Issues: https://github.com/somaai/backend/issues


### Upload Service (via Orchestrator)

#### Upload Image to S3 (Primary) / FTP (Fallback)
```typescript
POST /upload/image
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
- file: <binary image file>
- type: "product" | "invoice" | "document" | "profile"
- businessId: "business-uuid" (optional)

Response: 201 Created
{
  "id": "upload-uuid",
  "fileName": "image_2026_03_12.jpg",
  "type": "product",
  "url": "https://s3.amazonaws.com/somaai/uploads/image_2026_03_12.jpg",
  "ftpUrl": "ftp://backup.somaai.com/uploads/image_2026_03_12.jpg",
  "size": 245632,
  "mimeType": "image/jpeg",
  "uploadedAt": "2026-03-12T10:00:00Z"
}
```

#### Upload Base64 Image
```typescript
POST /upload/image-base64
Authorization: Bearer {token}
Content-Type: application/json

{
  "fileName": "invoice_2026_03_12.jpg",
  "imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "type": "invoice",
  "businessId": "business-uuid"
}

Response: 201 Created
{
  "id": "upload-uuid",
  "fileName": "invoice_2026_03_12.jpg",
  "type": "invoice",
  "url": "https://s3.amazonaws.com/somaai/uploads/invoice_2026_03_12.jpg",
  "ftpUrl": "ftp://backup.somaai.com/uploads/invoice_2026_03_12.jpg",
  "size": 15234,
  "mimeType": "image/jpeg",
  "uploadedAt": "2026-03-12T10:00:00Z"
}
```

#### Get Upload Info
```typescript
GET /upload/{uploadId}
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "upload-uuid",
  "fileName": "image_2026_03_12.jpg",
  "type": "product",
  "url": "https://s3.amazonaws.com/somaai/uploads/image_2026_03_12.jpg",
  "ftpUrl": "ftp://backup.somaai.com/uploads/image_2026_03_12.jpg",
  "size": 245632,
  "mimeType": "image/jpeg",
  "uploadedAt": "2026-03-12T10:00:00Z"
}
```

#### Delete Upload
```typescript
DELETE /upload/{uploadId}
Authorization: Bearer {token}

Response: 204 No Content
```

#### List Uploads
```typescript
GET /upload?type=product&businessId=business-uuid&page=1&limit=10
Authorization: Bearer {token}

Response: 200 OK
{
  "data": [
    {
      "id": "upload-uuid",
      "fileName": "image_2026_03_12.jpg",
      "type": "product",
      "url": "https://s3.amazonaws.com/somaai/uploads/image_2026_03_12.jpg",
      "size": 245632,
      "uploadedAt": "2026-03-12T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

## Upload Service Architecture

### Primary: AWS S3
- Armazenamento principal em cloud
- Escalável e confiável
- CDN integrado para distribuição rápida
- Backup automático

### Fallback: FTP
- Backup em servidor FTP
- Ativado automaticamente se S3 falhar
- Sincronização periódica
- Recuperação de desastres

### Upload Flow
```
Frontend
   ↓
Orchestrator (3009)
   ↓
Upload Service (3008)
   ├─→ S3 (Primary)
   │   └─→ Success ✓
   │
   └─→ FTP (Fallback)
       └─→ Success ✓
```

## Frontend Implementation Examples

### Upload Service Hook
```typescript
import { useState } from 'react';
import api from './api';

export const useUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (file: File, type: string, businessId?: string) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      if (businessId) {
        formData.append('businessId', businessId);
      }

      const { data } = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadBase64 = async (
    fileName: string,
    imageBase64: string,
    type: string,
    businessId?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/upload/image-base64', {
        fileName,
        imageBase64,
        type,
        businessId,
      });

      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { uploadImage, uploadBase64, loading, error, progress };
};
```

### Upload Component Example
```typescript
import React, { useState } from 'react';
import { useUpload } from './hooks/useUpload';

export const ImageUpload = ({ businessId, onUploadSuccess }) => {
  const { uploadImage, loading, error, progress } = useUpload();
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      const result = await uploadImage(file, 'product', businessId);
      onUploadSuccess(result);
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      <button onClick={handleUpload} disabled={loading || !file}>
        {loading ? `Uploading... ${progress}%` : 'Upload'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
```

### Drag & Drop Upload
```typescript
import React, { useState } from 'react';
import { useUpload } from './hooks/useUpload';

export const DragDropUpload = ({ businessId, onUploadSuccess }) => {
  const { uploadImage, loading, error, progress } = useUpload();
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      try {
        const result = await uploadImage(file, 'product', businessId);
        onUploadSuccess(result);
      } catch (err) {
        console.error('Upload error:', err);
      }
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      style={{
        border: dragActive ? '2px solid blue' : '2px dashed gray',
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
      }}
    >
      <p>Drag and drop your image here</p>
      {loading && <p>Uploading... {progress}%</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
```


## Email Service

### Send Email
```typescript
POST /email/send
Authorization: Bearer {token}
Content-Type: application/json

{
  "to": "customer@example.com",
  "subject": "Order Confirmation",
  "template": "order-confirmation",
  "data": {
    "orderNumber": "ORD-2026-001",
    "totalAmount": 250.50,
    "items": [
      {
        "name": "Product 1",
        "quantity": 2,
        "price": 100.00
      }
    ]
  }
}

Response: 200 OK
{
  "id": "email-uuid",
  "to": "customer@example.com",
  "subject": "Order Confirmation",
  "status": "sent",
  "sentAt": "2026-03-12T10:00:00Z"
}
```

### Send Bulk Email
```typescript
POST /email/send-bulk
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipients": [
    "customer1@example.com",
    "customer2@example.com",
    "customer3@example.com"
  ],
  "subject": "Special Offer",
  "template": "promotional",
  "data": {
    "discount": "20%",
    "validUntil": "2026-03-31"
  }
}

Response: 200 OK
{
  "id": "bulk-email-uuid",
  "recipientCount": 3,
  "status": "queued",
  "createdAt": "2026-03-12T10:00:00Z"
}
```

### Get Email Status
```typescript
GET /email/{emailId}
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "email-uuid",
  "to": "customer@example.com",
  "subject": "Order Confirmation",
  "status": "delivered",
  "sentAt": "2026-03-12T10:00:00Z",
  "deliveredAt": "2026-03-12T10:00:05Z",
  "opens": 1,
  "clicks": 0
}
```

### Email Templates

#### Available Templates
- `order-confirmation` - Confirmação de pedido
- `payment-receipt` - Recibo de pagamento
- `nfce-issued` - NFC-e emitida
- `password-reset` - Redefinição de senha
- `welcome` - Boas-vindas
- `promotional` - Promoção
- `invoice` - Fatura
- `delivery-notification` - Notificação de entrega

#### Create Custom Template
```typescript
POST /email/templates
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "custom-template",
  "subject": "Hello {{name}}",
  "htmlContent": "<h1>Welcome {{name}}</h1><p>{{message}}</p>",
  "textContent": "Welcome {{name}}\n{{message}}",
  "variables": ["name", "message"]
}

Response: 201 Created
{
  "id": "template-uuid",
  "name": "custom-template",
  "createdAt": "2026-03-12T10:00:00Z"
}
```

### Email Service Architecture

#### Primary: SendGrid
- Serviço de email em cloud
- Rastreamento de entrega
- Analytics de abertura/cliques
- Escalável e confiável

#### Fallback: SMTP
- Servidor SMTP local/externo
- Ativado se SendGrid falhar
- Configuração simples
- Backup de envios

#### Email Flow
```
Frontend/Backend
   ↓
Orchestrator (3009)
   ↓
Email Service (3010)
   ├─→ SendGrid (Primary)
   │   ├─→ Success ✓
   │   └─→ Failure
   │
   └─→ SMTP (Fallback)
       └─→ Success ✓
```

### Frontend Implementation

#### Email Hook
```typescript
import { useState } from 'react';
import api from './api';

export const useEmail = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendEmail = async (
    to: string,
    subject: string,
    template: string,
    data: any
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { data: response } = await api.post('/email/send', {
        to,
        subject,
        template,
        data,
      });

      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send email');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendBulkEmail = async (
    recipients: string[],
    subject: string,
    template: string,
    data: any
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { data: response } = await api.post('/email/send-bulk', {
        recipients,
        subject,
        template,
        data,
      });

      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send bulk email');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getEmailStatus = async (emailId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.get(`/email/${emailId}`);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get email status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { sendEmail, sendBulkEmail, getEmailStatus, loading, error };
};
```

#### Order Confirmation Email Example
```typescript
import React from 'react';
import { useEmail } from './hooks/useEmail';

export const OrderConfirmation = ({ order }) => {
  const { sendEmail, loading, error } = useEmail();

  const handleSendConfirmation = async () => {
    try {
      await sendEmail(
        order.customerEmail,
        `Order Confirmation - ${order.number}`,
        'order-confirmation',
        {
          orderNumber: order.number,
          totalAmount: order.totalAmount,
          items: order.items,
          estimatedDelivery: order.estimatedDelivery,
        }
      );
      alert('Confirmation email sent!');
    } catch (err) {
      console.error('Error sending email:', err);
    }
  };

  return (
    <div>
      <button onClick={handleSendConfirmation} disabled={loading}>
        {loading ? 'Sending...' : 'Send Confirmation Email'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
```

#### Promotional Campaign Example
```typescript
import React, { useState } from 'react';
import { useEmail } from './hooks/useEmail';

export const PromotionalCampaign = () => {
  const { sendBulkEmail, loading, error } = useEmail();
  const [recipients, setRecipients] = useState<string[]>([]);

  const handleSendCampaign = async () => {
    try {
      await sendBulkEmail(
        recipients,
        'Special Offer - 20% Off',
        'promotional',
        {
          discount: '20%',
          validUntil: '2026-03-31',
          couponCode: 'PROMO20',
        }
      );
      alert('Campaign sent to ' + recipients.length + ' recipients!');
    } catch (err) {
      console.error('Error sending campaign:', err);
    }
  };

  return (
    <div>
      <textarea
        placeholder="Enter email addresses (one per line)"
        onChange={(e) => setRecipients(e.target.value.split('\n'))}
      />
      <button onClick={handleSendCampaign} disabled={loading}>
        {loading ? 'Sending...' : 'Send Campaign'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
```

### Email Templates Examples

#### Order Confirmation Template
```html
<h1>Order Confirmation</h1>
<p>Thank you for your order!</p>

<h2>Order Details</h2>
<p><strong>Order Number:</strong> {{orderNumber}}</p>
<p><strong>Total Amount:</strong> R$ {{totalAmount}}</p>

<h2>Items</h2>
<ul>
  {{#each items}}
  <li>{{this.name}} - Qty: {{this.quantity}} - R$ {{this.price}}</li>
  {{/each}}
</ul>

<p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>

<p>Thank you for shopping with us!</p>
```

#### Payment Receipt Template
```html
<h1>Payment Receipt</h1>
<p>Your payment has been received.</p>

<h2>Payment Details</h2>
<p><strong>Transaction ID:</strong> {{transactionId}}</p>
<p><strong>Amount:</strong> R$ {{amount}}</p>
<p><strong>Payment Method:</strong> {{paymentMethod}}</p>
<p><strong>Date:</strong> {{date}}</p>

<p>Keep this receipt for your records.</p>
```

#### NFC-e Issued Template
```html
<h1>NFC-e Emitida</h1>
<p>Sua Nota Fiscal Eletrônica foi emitida com sucesso.</p>

<h2>Detalhes da NFC-e</h2>
<p><strong>Número:</strong> {{nfceNumber}}</p>
<p><strong>Série:</strong> {{series}}</p>
<p><strong>Valor Total:</strong> R$ {{totalValue}}</p>
<p><strong>Protocolo:</strong> {{protocolNumber}}</p>

<p><a href="{{nfceUrl}}">Visualizar NFC-e</a></p>
```
