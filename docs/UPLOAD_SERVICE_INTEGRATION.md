# Upload Service Integration Guide

## Overview
O serviço de upload aceita imagens em base64 e as salva no S3 (com fallback para FTP). Retorna a URL para ser salva no banco de dados.

## Como Usar

### 1. Instalar o cliente HTTP
```bash
npm install axios
```

### 2. Criar um serviço helper no seu módulo

```typescript
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ImageUploadService {
  private uploadServiceUrl = process.env.UPLOAD_SERVICE_URL || 'http://upload:3008';

  async uploadUserProfileImage(base64: string, userId: string): Promise<string> {
    try {
      const response = await axios.post(`${this.uploadServiceUrl}/upload`, {
        base64,
        folder: 'users',
        fileName: `profile-${userId}`,
      });
      return response.data.url;
    } catch (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async uploadBusinessLogo(base64: string, businessId: string): Promise<string> {
    try {
      const response = await axios.post(`${this.uploadServiceUrl}/upload`, {
        base64,
        folder: 'businesses',
        fileName: `logo-${businessId}`,
      });
      return response.data.url;
    } catch (error) {
      throw new Error(`Failed to upload logo: ${error.message}`);
    }
  }

  async uploadProductImage(base64: string, productId: string): Promise<string> {
    try {
      const response = await axios.post(`${this.uploadServiceUrl}/upload`, {
        base64,
        folder: 'products',
        fileName: `product-${productId}`,
      });
      return response.data.url;
    } catch (error) {
      throw new Error(`Failed to upload product image: ${error.message}`);
    }
  }
}
```

### 3. Usar no seu serviço

```typescript
// Exemplo: Criar usuário com foto de perfil
async createUser(createUserDto: CreateUserDto) {
  let profileImageUrl: string | null = null;

  if (createUserDto.profileImage) {
    profileImageUrl = await this.imageUploadService.uploadUserProfileImage(
      createUserDto.profileImage,
      userId,
    );
  }

  const user = await this.userRepository.save({
    ...createUserDto,
    profileImageUrl,
  });

  return user;
}
```

### 4. Variáveis de Ambiente

No `.env` do seu serviço:
```env
UPLOAD_SERVICE_URL=http://upload:3008
```

## Fluxo de Upload

1. **Frontend** envia imagem em base64
2. **Seu serviço** recebe o base64
3. **Seu serviço** chama o upload service com o base64
4. **Upload service** salva no S3 (ou FTP se S3 falhar)
5. **Upload service** retorna a URL
6. **Seu serviço** salva a URL no banco de dados

## Exemplo de Payload

```json
{
  "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "folder": "users",
  "fileName": "profile-123"
}
```

## Resposta

```json
{
  "id": "1234567890-abc123",
  "url": "https://s3.amazonaws.com/somaaiuploads/users/profile-123.png",
  "fileName": "profile-123.png"
}
```

## Serviços que Precisam

- **Monolith**: Criação de usuários (foto de perfil)
- **Business Service**: Criação de estabelecimento (logo)
- **Inventory Service**: Criação de estoque (imagem do produto)
