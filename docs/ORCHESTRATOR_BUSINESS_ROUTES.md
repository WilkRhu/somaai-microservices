# Orchestrator - Business Routes

## Overview

Todas as rotas do business service são acessadas através do orquestrador. O orquestrador atua como um gateway que roteia as requisições para o business service.

## Base URL
```
http://localhost:3009/api/business
```

## Authentication

Todas as rotas requerem um JWT token válido no header `Authorization`:

```
Authorization: Bearer {jwt_token}
```

## Establishments

### Create Establishment
```
POST /api/business/establishments
Authorization: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "name": "Meu Negócio",
  "cnpj": "12.345.678/0001-90",
  "email": "negocio@example.com",
  "phone": "+55 11 99999-9999",
  "address": "Rua Principal, 123",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234-567"
}

Response: 201 Created
{
  "id": "establishment-id",
  "ownerId": "user-id",
  "name": "Meu Negócio",
  "cnpj": "12.345.678/0001-90",
  "email": "negocio@example.com",
  "phone": "+55 11 99999-9999",
  "address": "Rua Principal, 123",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234-567",
  "isActive": true,
  "createdAt": "2024-03-14T10:30:00Z",
  "updatedAt": "2024-03-14T10:30:00Z"
}
```

### List Establishments
```
GET /api/business/establishments?skip=0&take=10
Authorization: Bearer {jwt_token}

Response: 200 OK
[
  {
    "id": "establishment-id-1",
    "ownerId": "user-id",
    "name": "Meu Negócio",
    ...
  }
]
```

### Get Establishment by ID
```
GET /api/business/establishments/:id
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "id": "establishment-id",
  "ownerId": "user-id",
  "name": "Meu Negócio",
  ...
}
```

### Update Establishment
```
PATCH /api/business/establishments/:id
Authorization: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "name": "Negócio Atualizado",
  "email": "novo@example.com"
}

Response: 200 OK
{
  "id": "establishment-id",
  "name": "Negócio Atualizado",
  "email": "novo@example.com",
  ...
}
```

### Delete Establishment
```
DELETE /api/business/establishments/:id
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "affected": 1
}
```

## Customers

### Create Customer
```
POST /api/business/customers
Authorization: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "establishmentId": "establishment-id",
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "+55 11 99999-9999",
  "cpf": "123.456.789-00",
  "address": "Rua A, 123",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234-567"
}

Response: 201 Created
{
  "id": "customer-id",
  "establishmentId": "establishment-id",
  "name": "João Silva",
  ...
}
```

### List Customers
```
GET /api/business/customers?skip=0&take=10
Authorization: Bearer {jwt_token}

Response: 200 OK
[
  {
    "id": "customer-id-1",
    "establishmentId": "establishment-id",
    "name": "João Silva",
    ...
  }
]
```

### Get Customer by ID
```
GET /api/business/customers/:id
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "id": "customer-id",
  "establishmentId": "establishment-id",
  "name": "João Silva",
  ...
}
```

### Update Customer
```
PATCH /api/business/customers/:id
Authorization: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "name": "João Silva Santos",
  "email": "joao.silva@example.com"
}

Response: 200 OK
{
  "id": "customer-id",
  "name": "João Silva Santos",
  ...
}
```

### Delete Customer
```
DELETE /api/business/customers/:id
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "affected": 1
}
```

## Inventory

### Create Inventory Item
```
POST /api/business/inventory
Authorization: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "establishmentId": "establishment-id",
  "name": "Produto A",
  "sku": "SKU-001",
  "quantity": 100,
  "minQuantity": 10,
  "price": 29.99
}

Response: 201 Created
{
  "id": "product-id",
  "establishmentId": "establishment-id",
  "name": "Produto A",
  ...
}
```

### List Inventory Items
```
GET /api/business/inventory?skip=0&take=10
Authorization: Bearer {jwt_token}

Response: 200 OK
[
  {
    "id": "product-id-1",
    "establishmentId": "establishment-id",
    "name": "Produto A",
    ...
  }
]
```

### Get Inventory Item by ID
```
GET /api/business/inventory/:id
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "id": "product-id",
  "establishmentId": "establishment-id",
  "name": "Produto A",
  ...
}
```

### Update Inventory Item
```
PATCH /api/business/inventory/:id
Authorization: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "quantity": 150,
  "price": 34.99
}

Response: 200 OK
{
  "id": "product-id",
  "quantity": 150,
  "price": 34.99,
  ...
}
```

### Delete Inventory Item
```
DELETE /api/business/inventory/:id
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "affected": 1
}
```

## Sales

### Create Sale
```
POST /api/business/sales
Authorization: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "establishmentId": "establishment-id",
  "customerId": "customer-id",
  "totalAmount": 299.90,
  "status": "completed"
}

Response: 201 Created
{
  "id": "sale-id",
  "establishmentId": "establishment-id",
  "customerId": "customer-id",
  "totalAmount": 299.90,
  "status": "completed",
  ...
}
```

### List Sales
```
GET /api/business/sales?skip=0&take=10
Authorization: Bearer {jwt_token}

Response: 200 OK
[
  {
    "id": "sale-id-1",
    "establishmentId": "establishment-id",
    "customerId": "customer-id",
    ...
  }
]
```

### Get Sale by ID
```
GET /api/business/sales/:id
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "id": "sale-id",
  "establishmentId": "establishment-id",
  "customerId": "customer-id",
  ...
}
```

### Update Sale
```
PUT /api/business/sales/:id
Authorization: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "status": "cancelled"
}

Response: 200 OK
{
  "id": "sale-id",
  "status": "cancelled",
  ...
}
```

### Delete Sale
```
DELETE /api/business/sales/:id
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "affected": 1
}
```

## Expenses

### Create Expense
```
POST /api/business/expenses
Authorization: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "establishmentId": "establishment-id",
  "description": "Aluguel do mês",
  "amount": 1500.00,
  "category": "rent",
  "status": "paid"
}

Response: 201 Created
{
  "id": "expense-id",
  "establishmentId": "establishment-id",
  "description": "Aluguel do mês",
  ...
}
```

### List Expenses
```
GET /api/business/expenses?skip=0&take=10
Authorization: Bearer {jwt_token}

Response: 200 OK
[
  {
    "id": "expense-id-1",
    "establishmentId": "establishment-id",
    "description": "Aluguel do mês",
    ...
  }
]
```

### Get Expense by ID
```
GET /api/business/expenses/:id
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "id": "expense-id",
  "establishmentId": "establishment-id",
  "description": "Aluguel do mês",
  ...
}
```

### Update Expense
```
PATCH /api/business/expenses/:id
Authorization: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "status": "pending"
}

Response: 200 OK
{
  "id": "expense-id",
  "status": "pending",
  ...
}
```

### Delete Expense
```
DELETE /api/business/expenses/:id
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "affected": 1
}
```

## Suppliers

### Create Supplier
```
POST /api/business/suppliers
Authorization: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "establishmentId": "establishment-id",
  "name": "Fornecedor XYZ",
  "cnpj": "98.765.432/0001-10",
  "email": "fornecedor@example.com",
  "phone": "+55 11 77777-7777",
  "address": "Rua B, 456",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234-567"
}

Response: 201 Created
{
  "id": "supplier-id",
  "establishmentId": "establishment-id",
  "name": "Fornecedor XYZ",
  ...
}
```

### List Suppliers
```
GET /api/business/suppliers?skip=0&take=10
Authorization: Bearer {jwt_token}

Response: 200 OK
[
  {
    "id": "supplier-id-1",
    "establishmentId": "establishment-id",
    "name": "Fornecedor XYZ",
    ...
  }
]
```

### Get Supplier by ID
```
GET /api/business/suppliers/:id
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "id": "supplier-id",
  "establishmentId": "establishment-id",
  "name": "Fornecedor XYZ",
  ...
}
```

### Update Supplier
```
PATCH /api/business/suppliers/:id
Authorization: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "name": "Fornecedor XYZ Ltda",
  "email": "novo@fornecedor.com"
}

Response: 200 OK
{
  "id": "supplier-id",
  "name": "Fornecedor XYZ Ltda",
  ...
}
```

### Delete Supplier
```
DELETE /api/business/suppliers/:id
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "affected": 1
}
```

## Offers

### Create Offer
```
POST /api/business/offers
Authorization: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "establishmentId": "establishment-id",
  "name": "Promoção de Verão",
  "description": "Desconto de 20% em produtos selecionados",
  "discountType": "percentage",
  "discountValue": 20,
  "startDate": "2024-03-14T00:00:00Z",
  "endDate": "2024-03-31T23:59:59Z"
}

Response: 201 Created
{
  "id": "offer-id",
  "establishmentId": "establishment-id",
  "name": "Promoção de Verão",
  ...
}
```

### List Offers
```
GET /api/business/offers?skip=0&take=10
Authorization: Bearer {jwt_token}

Response: 200 OK
[
  {
    "id": "offer-id-1",
    "establishmentId": "establishment-id",
    "name": "Promoção de Verão",
    ...
  }
]
```

### Get Offer by ID
```
GET /api/business/offers/:id
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "id": "offer-id",
  "establishmentId": "establishment-id",
  "name": "Promoção de Verão",
  ...
}
```

### Update Offer
```
PATCH /api/business/offers/:id
Authorization: Bearer {jwt_token}
Content-Type: application/json

Request Body:
{
  "discountValue": 25,
  "isActive": false
}

Response: 200 OK
{
  "id": "offer-id",
  "discountValue": 25,
  "isActive": false,
  ...
}
```

### Delete Offer
```
DELETE /api/business/offers/:id
Authorization: Bearer {jwt_token}

Response: 200 OK
{
  "affected": 1
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "name is required",
    "email must be valid"
  ]
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## Query Parameters

### Pagination
- `skip`: Number of items to skip (default: 0)
- `take`: Number of items to return (default: 10)

Example:
```
GET /api/business/establishments?skip=20&take=10
```

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - User doesn't have permission
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Notes

- All timestamps are in ISO 8601 format (UTC)
- All monetary values are in decimal format (e.g., 29.99)
- All IDs are UUIDs
- Establishment ID is required for most operations
- User ID is extracted from JWT token
- The orchestrator forwards requests to the business service
- Authorization is handled by the orchestrator's AuthGuard
