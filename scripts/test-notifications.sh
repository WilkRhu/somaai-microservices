#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing Notifications Service${NC}\n"

# Test health
echo -e "${YELLOW}1. Testing Health Endpoint${NC}"
curl -s http://localhost:3011/health | jq . || echo "Failed to connect"
echo ""

# Test send email
echo -e "${YELLOW}2. Testing Send Email${NC}"
curl -s -X POST http://localhost:3011/notifications/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "template": "user-welcome",
    "data": {
      "userName": "Test User"
    }
  }' | jq .
echo ""

# Test send notification
echo -e "${YELLOW}3. Testing Send Notification${NC}"
curl -s -X POST http://localhost:3011/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "type": "email",
    "title": "Test Notification",
    "message": "<h1>Test</h1>",
    "recipient": "test@example.com"
  }' | jq .
echo ""

# Test get preferences
echo -e "${YELLOW}4. Testing Get Preferences${NC}"
curl -s http://localhost:3011/notifications/preferences/test-user-123 | jq .
echo ""

# Test update preferences
echo -e "${YELLOW}5. Testing Update Preferences${NC}"
curl -s -X PUT http://localhost:3011/notifications/preferences/test-user-123 \
  -H "Content-Type: application/json" \
  -d '{
    "emailEnabled": true,
    "smsEnabled": false,
    "pushEnabled": true,
    "marketingEmails": false
  }' | jq .
echo ""

echo -e "${GREEN}Tests completed!${NC}"
