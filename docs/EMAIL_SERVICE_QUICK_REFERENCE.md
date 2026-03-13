# Email Service - Quick Reference Card

## Quick Start

### Start Services
```bash
docker-compose up -d
```

### Access Email Service
```
Base URL: http://localhost:3009/email
```

## API Endpoints

### Send Email
```bash
POST /email/send
Content-Type: application/json

{
  "to": "user@example.com",
  "cc": ["cc@example.com"],
  "bcc": ["bcc@example.com"],
  "subject": "Welcome",
  "template": "user-welcome",
  "data": {
    "userName": "John Doe"
  }
}
```

### Send Bulk Email
```bash
POST /email/send-bulk
Content-Type: application/json

{
  "recipients": ["user1@example.com", "user2@example.com"],
  "subject": "Update",
  "template": "admin-welcome",
  "data": {
    "userName": "Admin",
    "expirationDate": "2026-03-20"
  }
}
```

### Get Email Status
```bash
GET /email/{emailId}
```

## Available Templates

| Template | Purpose | Required Data |
|----------|---------|----------------|
| `user-welcome` | New user welcome | `userName` |
| `user-password-reset` | Password reset | `resetLink`, `expirationTime` |
| `user-lifetime-access-activated` | Access activation | `userName`, `expirationDate` |
| `user-trial-activation` | Trial activation | `userName` |
| `user-trial-expiring` | Trial expiration | `userName`, `expirationDate` |
| `admin-welcome` | Admin welcome | `userName`, `expirationDate` |
| `admin-user-created` | New user notification | `adminName`, `newUserName`, `userRole` |
| `support-welcome` | Support team welcome | `userName` |
| `support-ticket-assigned` | Ticket assignment | `ticketId`, `subject` |
| `fiscal-note` | Fiscal notification | (template specific) |

## Configuration

### Email Service Port
```
3012 (internal)
3009 (via Orchestrator)
```

### Database
```
Host: 193.203.175.121
Port: 3306
User: u752511550_user_business
Pass: @Wilk2026#
DB: u752511550_somaai_busines
```

### Email Providers
```
Primary: SendGrid
Fallback: SMTP (Hostinger)
```

## Common Tasks

### Send Welcome Email
```bash
curl -X POST http://localhost:3009/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "newuser@example.com",
    "subject": "Welcome to SomaAI",
    "template": "user-welcome",
    "data": {"userName": "John"}
  }'
```

### Send Password Reset
```bash
curl -X POST http://localhost:3009/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Reset Your Password",
    "template": "user-password-reset",
    "data": {
      "resetLink": "https://app.example.com/reset?token=xyz",
      "expirationTime": "1 hour"
    }
  }'
```

### Send Bulk Email
```bash
curl -X POST http://localhost:3009/email/send-bulk \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["user1@example.com", "user2@example.com"],
    "subject": "Important Update",
    "template": "admin-welcome",
    "data": {"userName": "Admin"}
  }'
```

### Check Email Status
```bash
curl http://localhost:3009/email/550e8400-e29b-41d4-a716-446655440000
```

## Email Status Values

| Status | Meaning |
|--------|---------|
| `PENDING` | Email created, waiting to send |
| `SENT` | Successfully sent |
| `FAILED` | Failed to send |
| `DELIVERED` | Confirmed delivery |
| `OPENED` | Email opened |
| `CLICKED` | Link clicked |

## Troubleshooting

### Service Not Running
```bash
docker-compose logs email
docker ps | grep email
```

### Email Not Sending
```bash
# Check SendGrid API key
echo $SENDGRID_API_KEY

# Check SMTP fallback
docker-compose logs email | grep SMTP

# Verify database connection
mysql -h 193.203.175.121 -u u752511550_user_business -p
```

### Template Not Found
```bash
# List available templates
curl http://localhost:3009/email/templates

# Check template data matches requirements
# See "Available Templates" table above
```

## Environment Variables

### Required
```
SENDGRID_API_KEY=your-key
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=somaai@wilkcaetano.com.br
SMTP_PASSWORD=@Wilk2026#
```

### Optional
```
EMAIL_PROVIDER=sendgrid
SMTP_FROM=somaai@wilkcaetano.com.br
SMTP_FROM_NAME=SomaAI
```

## Response Examples

### Success Response
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "to": "user@example.com",
  "subject": "Welcome",
  "status": "SENT",
  "sentAt": "2026-03-13T10:30:00Z"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Template not found",
  "error": "Bad Request"
}
```

## Performance Tips

1. **Bulk Emails**: Use `/email/send-bulk` for multiple recipients
2. **Caching**: Email service uses Redis for caching
3. **Database**: Queries are optimized with indexes
4. **Failover**: Automatic SMTP fallback if SendGrid fails

## Monitoring

### View Logs
```bash
docker-compose logs -f email
```

### Check Service Health
```bash
curl http://localhost:3009/health
```

### Monitor Database
```bash
mysql -h 193.203.175.121 -u u752511550_user_business -p
SELECT COUNT(*) FROM email;
SELECT * FROM email WHERE status = 'FAILED';
```

## Integration Examples

### Node.js/Express
```javascript
const axios = require('axios');

async function sendEmail(to, template, data) {
  const response = await axios.post('http://localhost:3009/email/send', {
    to,
    subject: 'Email Subject',
    template,
    data
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}
```

### React/Frontend
```javascript
const sendEmail = async (to, template, data) => {
  const response = await fetch('http://localhost:3009/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      to,
      subject: 'Email Subject',
      template,
      data
    })
  });
  return response.json();
};
```

## Documentation Links

- **Full Guide**: `docs/EMAIL_SERVICE_INTEGRATION_COMPLETE.md`
- **Docker Setup**: `docs/QUICK_START_DOCKER_COMPLETE.md`
- **Phase Report**: `docs/PHASE5_EMAIL_SERVICE_COMPLETE.md`
- **Session Summary**: `docs/SESSION_COMPLETION_SUMMARY.md`

## Support

For issues:
1. Check service logs: `docker-compose logs email`
2. Verify configuration: Check `.env` files
3. Test connectivity: `curl http://localhost:3009/email/health`
4. Review documentation in `docs/` folder

---

**Last Updated**: March 13, 2026
**Version**: 1.0.0
**Status**: Production Ready
