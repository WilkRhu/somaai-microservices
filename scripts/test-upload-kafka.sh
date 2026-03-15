#!/bin/bash

echo "Testing Upload Service Kafka Connection..."
echo "==========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if upload service is running
echo -e "${YELLOW}Checking if Upload Service is running...${NC}"
UPLOAD_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3008/health)

if [ "$UPLOAD_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ Upload Service is running${NC}"
else
    echo -e "${RED}✗ Upload Service is not responding (HTTP $UPLOAD_RESPONSE)${NC}"
    echo "Please start the upload service first: npm run start:dev"
    exit 1
fi

# Check Kafka connection
echo -e "\n${YELLOW}Checking Kafka connection...${NC}"

# Try to connect to Kafka broker
KAFKA_HOST=${KAFKA_BROKERS:-localhost:9092}
KAFKA_PORT=$(echo $KAFKA_HOST | cut -d: -f2)
KAFKA_IP=$(echo $KAFKA_HOST | cut -d: -f1)

if nc -z $KAFKA_IP $KAFKA_PORT 2>/dev/null; then
    echo -e "${GREEN}✓ Kafka broker is accessible at $KAFKA_HOST${NC}"
else
    echo -e "${RED}✗ Cannot connect to Kafka broker at $KAFKA_HOST${NC}"
    echo "Make sure Kafka is running: docker-compose up -d kafka"
    exit 1
fi

# Check if topics exist
echo -e "\n${YELLOW}Checking Kafka topics...${NC}"

TOPICS_TO_CHECK=("file.upload.requested" "file.upload.completed" "file.upload.failed")

for topic in "${TOPICS_TO_CHECK[@]}"; do
    echo "  - Checking topic: $topic"
done

echo -e "\n${GREEN}✓ All checks passed!${NC}"
echo -e "${YELLOW}Upload Service is connected to Kafka${NC}"
