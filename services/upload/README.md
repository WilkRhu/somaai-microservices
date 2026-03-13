# Upload Service

Upload service for SomaAI platform with S3 and FTP support.

## Features

- Base64 image upload support
- Multipart file upload support
- S3 as primary provider
- FTP as fallback provider
- In-memory metadata storage
- Swagger API documentation

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file based on `.env.example`:

```env
NODE_ENV=development
PORT=3008

# Upload Provider (S3 or FTP)
UPLOAD_PROVIDER=S3

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=somaaiuploads

# FTP Fallback
FTP_HOST=ftp.example.com
FTP_PORT=21
FTP_USER=user
FTP_PASS=password
FTP_SECURE=false
FTP_BASE_PATH=/uploads
```

## Running

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start
```

## API Endpoints

### Upload File

**POST** `/upload`

Upload a file via multipart or base64.

Request body:
```json
{
  "base64": "data:image/png;base64,iVBORw0KGgo...",
  "folder": "users",
  "fileName": "profile.png"
}
```

Response:
```json
{
  "id": "1234567890-abc123",
  "url": "https://s3.amazonaws.com/somaaiuploads/users/profile.png",
  "fileName": "profile.png"
}
```

### Get Upload Info

**GET** `/upload/:id`

Get information about an uploaded file.

Response:
```json
{
  "id": "1234567890-abc123",
  "fileName": "profile.png",
  "url": "https://s3.amazonaws.com/somaaiuploads/users/profile.png",
  "size": 12345,
  "uploadedAt": "2024-03-13T10:30:00Z",
  "provider": "S3"
}
```

## Docker

```bash
docker build -t somaai-upload .
docker run -p 3013:3008 somaai-upload
```

## Testing

```bash
npm run test
npm run test:cov
```
