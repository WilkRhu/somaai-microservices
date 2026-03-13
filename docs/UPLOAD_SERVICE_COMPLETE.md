# Upload Service - Complete Setup

## Status: ✅ COMPLETE

O serviço de upload foi completamente configurado e integrado ao projeto.

## Arquivos Criados/Configurados

### Estrutura Principal
- `services/upload/Dockerfile` - Docker configuration
- `services/upload/.dockerignore` - Docker ignore rules
- `services/upload/.gitignore` - Git ignore rules
- `services/upload/.eslintrc.js` - ESLint configuration
- `services/upload/.prettierrc` - Prettier configuration
- `services/upload/jest.config.js` - Jest testing configuration
- `services/upload/tsconfig.json` - TypeScript configuration
- `services/upload/tsconfig.build.json` - TypeScript build configuration
- `services/upload/nest-cli.json` - NestJS CLI configuration
- `services/upload/package.json` - Dependencies (removed axios, added @types/multer)
- `services/upload/README.md` - Service documentation

### Source Code
- `services/upload/src/main.ts` - Application entry point
- `services/upload/src/app.module.ts` - Main module
- `services/upload/src/app.controller.ts` - Health check endpoint
- `services/upload/src/app.service.ts` - Health check service
- `services/upload/src/upload/upload.module.ts` - Upload module
- `services/upload/src/upload/upload.controller.ts` - Upload endpoints
- `services/upload/src/upload/upload.service.ts` - Upload business logic
- `services/upload/src/upload/dto/upload-file.dto.ts` - Upload DTO
- `services/upload/src/upload/enums/upload-provider.enum.ts` - Provider enum
- `services/upload/src/upload/services/s3.service.ts` - S3 provider
- `services/upload/src/upload/services/ftp.service.ts` - FTP provider

### Configuration
- `services/upload/.env` - Environment variables (cleaned)
- `services/upload/.env.example` - Example environment variables

## Features

### Upload Endpoints
- **POST /upload** - Upload file via multipart or base64
  - Accepts `base64`, `folder`, `fileName` in request body
  - Returns `id`, `url`, `fileName`
  
- **GET /upload/:id** - Get upload information
  - Returns upload metadata including size, provider, timestamp

### Providers
- **S3 (Primary)** - AWS S3 bucket storage
- **FTP (Fallback)** - FTP server fallback if S3 fails

### Features
- Base64 image upload support
- Multipart file upload support
- In-memory metadata storage
- Automatic fallback from S3 to FTP
- Swagger API documentation
- Health check endpoint

## Integration

### Docker Compose
- Added `upload` service on port 3013 (internal 3008)
- Configured environment variables for S3 and FTP
- Added to `somaai-network`

### Monolith Integration
- `ImageUploadService` in `services/monolith/src/users/services/image-upload.service.ts`
- Automatically uploads profile images when creating/updating users
- Stores URL in database

### Orchestrator Integration
- Added `UPLOAD_SERVICE_URL` environment variable
- Can call upload service from orchestrator

## Environment Variables

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

## Compilation Status

✅ All files compile without errors
✅ No TypeScript errors
✅ No missing dependencies
✅ Docker configuration ready
✅ Integration with monolith complete

## Running

### Local Development
```bash
cd services/upload
npm install
npm run start:dev
```

### Docker
```bash
docker-compose up upload
```

### Testing
```bash
npm run test
npm run test:cov
```

## API Documentation

Swagger documentation available at: `http://localhost:3013/api`

## Next Steps

1. Set AWS credentials in `.env` or docker-compose
2. Set FTP credentials in `.env` or docker-compose
3. Run `docker-compose up` to start all services
4. Test upload endpoint with base64 image
5. Verify image URL is stored in database

## Notes

- Upload service is stateless (in-memory metadata only)
- Metadata is lost on service restart
- For persistent metadata, consider adding database storage
- S3 is primary provider, FTP is fallback
- Both providers must be configured for full functionality
