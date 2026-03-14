#!/bin/bash

# Test OCR Extract Base64 endpoint

echo "Testing OCR Extract Base64 endpoint..."
echo ""

# Simple 1x1 pixel PNG in base64
BASE64_IMAGE="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

# Test on Orchestrator (port 3009)
echo "1. Testing on Orchestrator (http://localhost:3009/api/monolith/ocr/extract-base64)"
curl -X POST http://localhost:3009/api/monolith/ocr/extract-base64 \
  -H "Content-Type: application/json" \
  -d "{
    \"imageBase64\": \"$BASE64_IMAGE\",
    \"documentType\": \"receipt\",
    \"language\": \"por\"
  }" \
  -w "\nStatus: %{http_code}\n\n"

# Test on OCR Service (port 3007)
echo "2. Testing on OCR Service (http://localhost:3007/api/ocr/extract-base64)"
curl -X POST http://localhost:3007/api/ocr/extract-base64 \
  -H "Content-Type: application/json" \
  -d "{
    \"imageBase64\": \"$BASE64_IMAGE\",
    \"documentType\": \"receipt\",
    \"language\": \"por\"
  }" \
  -w "\nStatus: %{http_code}\n\n"

# Test on Monolith (port 3000)
echo "3. Testing on Monolith (http://localhost:3000/api/monolith/ocr/extract-base64)"
curl -X POST http://localhost:3000/api/monolith/ocr/extract-base64 \
  -H "Content-Type: application/json" \
  -d "{
    \"imageBase64\": \"$BASE64_IMAGE\",
    \"documentType\": \"receipt\",
    \"language\": \"por\"
  }" \
  -w "\nStatus: %{http_code}\n\n"
