# Payment Gateway Integration API

Backend Payment Gateway Integration REST API built with Node.js and Express.js.

This project uses Google OAuth 2.0 for authentication, JWT to access protected endpoints, and Role-Based Authorization to differentiate `ADMIN` and `CUSTOMER` access. The project also implements product management, order management, and payment gateway integration using Midtrans Snap Sandbox.

The database uses MySQL with Prisma ORM. Development is done locally using Laragon, and API testing is done using Postman. Ngrok is used to connect the Midtrans webhook to the backend running on localhost.

---

## Features

### Google OAuth 2.0

- Authentication using Google OAuth 2.0
- Retrieve user information from Google
- Create users based on Google accounts
- Generate JWT Access Token after successful authentication

### JWT Authentication

- Generate Access Token
- Verify Access Token using middleware
- Store authenticated user information in `req.user`
- Protect protected endpoints

### Role-Based Authorization

The project uses two roles:

- `ADMIN`
- `CUSTOMER`

```text
ADMIN
→ Product Management

CUSTOMER
→ Order Management
→ Payment Management
```

### Product Management

- Create product
- Get all products
- Get product by ID
- Update product using `PATCH`
- Delete product
- Admin-only product management
- `user_id` is taken from the authenticated user

### Order Management

- Create order for customers
- Create multiple order items
- Product validation
- Prevent duplicate products in a single order
- Retrieve product price from the database
- Calculate subtotal
- Calculate order total
- Generate order number
- Database transaction for Order and Order Details

### Payment Gateway

- Create payment transaction using Midtrans Snap
- Use `order_number` as the Midtrans transaction identifier
- Use `total_amount` as the gross amount
- Store Snap Token
- Store Redirect URL
- Store payment reference and payment method
- Store payment status and timestamp

### Midtrans Webhook

- Receive payment notification from Midtrans
- Process notification using Midtrans transaction notification
- Find order by `order_number`
- Validate gross amount
- Payment status mapping
- Update Payment and Order using database transaction
- Handle notifications that have already been processed

---

## Authentication Flow

### Google OAuth 2.0 Flow

> Authentication in this project uses Google OAuth 2.0 only.

```text
User
  ↓
Google OAuth
  ↓
Google Authorization
  ↓
Google Callback
  ↓
Get Google Account Information
  ↓
Find / Create User
  ↓
Generate JWT Access Token
  ↓
Authentication Success
```

### JWT Authentication Flow

```text
Client
  ↓
Authorization: Bearer <accessToken>
  ↓
Authentication Middleware
  ↓
Extract Token
  ↓
Verify JWT
  ↓
Valid?
  ├── No → 401 Unauthorized
  │
  └── Yes
       ↓
    req.user
       ↓
    Continue Request
```

---

## Authorization Flow

```text
JWT Authentication
  ↓
req.user.role
  ↓
Role Middleware
  ↓
Check Allowed Role
  ↓
Role Allowed?
  ├── No → 403 Forbidden
  │
  └── Yes
       ↓
    Controller
```

---

## Product Flow

### Create Product

```text
Admin
  ↓
POST /api/products
  ↓
JWT Authentication
  ↓
ADMIN Authorization
  ↓
Validation
  ↓
Create Product
  ↓
user_id = authenticated user
  ↓
Product Created
```

### Update Product

```text
Admin
  ↓
PATCH /api/products/:id
  ↓
JWT Authentication
  ↓
ADMIN Authorization
  ↓
Validation
  ↓
Find Product
  ↓
Update Product
```

Fields that can be updated:

- `product_name`
- `description`
- `price`

---

## Order Flow

### Create Order

```text
Customer
  ↓
POST /api/orders
  ↓
JWT Authentication
  ↓
CUSTOMER Authorization
  ↓
Validation
  ↓
Get Product IDs
  ↓
Check Duplicate Products
  ↓
Find Products
  ↓
Calculate Subtotal
  ↓
Calculate Total Amount
  ↓
Generate Order Number
  ↓
Database Transaction
  ↓
Create Order
  ↓
Create Order Details
  ↓
COMMIT
  ↓
Order Created
```

#### Create Order Request

```http
POST /api/orders
Authorization: Bearer <accessToken>
```

```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 3,
      "quantity": 1
    }
  ]
}
```

The client only sends:

- `product_id`
- `quantity`

The backend handles:

- `user_id`
- `price`
- `subtotal`
- `total_amount`
- `order_number`
- `status_order`

#### Order Number

Example:

```text
ORD-20260926-8931
```

Format:

```text
ORD-YYYYMMDD-RANDOM_NUMBER
```

---

## Payment Flow

### Create Payment

```text
Customer
  ↓
POST /api/payments
  ↓
JWT Authentication
  ↓
CUSTOMER Authorization
  ↓
Find Order
  ↓
Check Order Ownership
  ↓
Check Order Status
  ↓
Find Existing Payment
  ↓
Existing Payment?
  ├── PENDING → Reuse Existing Snap Data
  ├── PAID → Reject New Payment
  │
  └── No Payment
       ↓
    Create Midtrans Transaction
       ↓
    Store Payment Data
       ↓
    Return Snap Token + Redirect URL
```

#### Create Payment Request

```http
POST /api/payments
Authorization: Bearer <accessToken>
```

```json
{
  "order_id": 1
}
```

The client does not send:

- `amount`
- `payment_reference`
- `payment_method`
- `status_payment`
- `snap_token`
- `redirect_url`

---

## Midtrans Integration

This project uses Midtrans Snap Sandbox.

Transaction data sent:

- `transaction_details.order_id`
- `transaction_details.gross_amount`

Mapping:

```text
transaction_details.order_id
        ↓
Orders.order_number

transaction_details.gross_amount
        ↓
Orders.total_amount
```

After the transaction is created, Midtrans returns:

- `snap_token`
- `redirect_url`

---

## Payment Status

Payment statuses used:

- `PENDING`
- `PAID`
- `FAILED`
- `EXPIRED`

### Payment Status Mapping

| Midtrans Status | Application Status |
| --- | --- |
| `pending` | `PENDING` |
| `settlement` | `PAID` |
| `capture` + `accept` | `PAID` |
| `capture` + `challenge` | `PENDING` |
| `capture` + other fraud result | `FAILED` |
| `expire` | `EXPIRED` |
| `cancel` | `FAILED` |
| `deny` | `FAILED` |
| `failure` | `FAILED` |

---

## Midtrans Webhook Flow

The webhook receives notifications from Midtrans and does not use JWT authentication.

```text
Midtrans
  ↓
POST /api/payments/webhook
  ↓
Receive Notification
  ↓
Midtrans Transaction Notification
  ↓
Find Order by order_number
  ↓
Find Payment by order_id
  ↓
Validate Gross Amount
  ↓
Determine Payment Status
  ↓
Database Transaction
  ↓
Update Payment
  ↓
Update Order
  ↓
Return HTTP 200
```

### Identifier Flow

```text
Midtrans order_id
        ↓
Orders.order_number
        ↓
Orders.id
        ↓
Payments.order_id
        ↓
Payments.id
```

Payment uses `Payments.id` for updates.

Order uses `Orders.id` for updates.

---

## Database Design

This project uses MySQL and Prisma ORM.

### Main Tables

```text
Products
   │
   ▼
Orders
   │
   ├── Order Details
   │
   └── Payments
```

### Products

Stores product information.

Typical fields:

- `id`
- `user_id`
- `product_name`
- `description`
- `price`
- `created_at`
- `updated_at`

### Orders

Stores main order information.

Typical fields:

- `id`
- `user_id`
- `order_number`
- `total_amount`
- `status_order`
- `created_at`
- `updated_at`

### Order Details

Stores the products contained in an order.

Typical fields:

- `id`
- `order_id`
- `product_id`
- `quantity`
- `price`
- `subtotal`

### Payments

Stores payment information for an order.

Typical fields:

- `id`
- `order_id`
- `payment_reference`
- `payment_method`
- `amount`
- `status_payment`
- `snap_token`
- `redirect_url`
- `paid_at`
- `expired_at`
- `created_at`
- `updated_at`

Relation:

```text
Orders 1 ───── 1 Payments
```

---

## Database Transaction

### Order Creation

```text
START TRANSACTION
       ↓
Create Order
       ↓
Create Order Details
       ↓
Success?
  ├── Yes → COMMIT
  │
  └── No → ROLLBACK
```

### Payment Webhook

```text
START TRANSACTION
       ↓
Update Payment
       ↓
Update Order
       ↓
Success?
  ├── Yes → COMMIT
  │
  └── No → ROLLBACK
```

---

## Layered Architecture

```text
Client
  ↓
Routes
  ↓
Middleware
  ↓
Controllers
  ↓
Services
  ↓
Repository
  ↓
Prisma ORM
  ↓
MySQL
```

### Middleware

Responsible for:

- Authentication
- Authorization
- Request validation

### Controller

Responsible for:

- Receiving HTTP requests
- Retrieving request data
- Calling services
- Returning HTTP responses

### Service

Responsible for:

- Business logic
- Product management
- Order processing
- Payment processing
- Midtrans integration
- Webhook processing
- Transaction orchestration

### Repository

Responsible for:

- Database queries
- Create data
- Find data
- Update data
- Delete data

### Prisma ORM

Responsible for database interaction and query execution.

---

## Technology Stack

### Backend

- Node.js
- Express.js
- JavaScript ES Modules

### Database

- MySQL
- Prisma ORM
- Laragon

### Authentication

- Google OAuth 2.0
- JSON Web Token (JWT)

### Validation

- Joi

### Payment Gateway

- Midtrans Snap Sandbox

### Testing

- Postman

### Webhook Development

- ngrok

---

## Libraries

- `express`
- `prisma`
- `@prisma/client`
- `joi`
- `jsonwebtoken`
- `midtrans-client`
- `dotenv`

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET/POST` | `/api/auth/google` | Google OAuth Authentication |

### Products

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/products` | Get All Products |
| `GET` | `/api/products/:id` | Get Product by ID |
| `POST` | `/api/products` | Create Product |
| `PATCH` | `/api/products/:id` | Update Product |
| `DELETE` | `/api/products/:id` | Delete Product |

Authorization:

```text
GET    → Authenticated User
POST   → ADMIN
PATCH  → ADMIN
DELETE → ADMIN
```

### Orders

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/orders` | Create Order |

Authorization:

```text
CUSTOMER
```

### Payments

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/payments` | Create Midtrans Payment |
| `POST` | `/api/payments/webhook` | Receive Midtrans Notification |

Authorization:

```text
POST /api/payments
→ CUSTOMER

POST /api/payments/webhook
→ Midtrans
```

---

## Postman Testing

The API is tested using Postman.

Main testing flow:

```text
1. Google OAuth Authentication
       ↓
2. Get JWT Access Token
       ↓
3. Test JWT Authentication
       ↓
4. Test Role Authorization
       ↓
5. Create Product as ADMIN
       ↓
6. Create Order as CUSTOMER
       ↓
7. Create Payment
       ↓
8. Open Midtrans Snap
       ↓
9. Complete Payment
       ↓
10. Receive Webhook
       ↓
11. Verify Payment Status
       ↓
12. Verify Order Status
```

Payment methods successfully tested on Midtrans Sandbox:

- QRIS
- BCA Bank Transfer
- BRI Bank Transfer

---

## Ngrok Webhook Testing

Because the backend runs on localhost, ngrok is used so that Midtrans can access the webhook endpoint.

```text
Midtrans
  ↓
Public ngrok URL
  ↓
Localhost
  ↓
Express Webhook Route
```

Example:

```text
https://<ngrok-id>.ngrok-free.app/api/payments/webhook
```

This URL is used as the Midtrans Payment Notification URL.

---

## Project Structure

```text
src/
│
├── config/
│   ├── db.js
│   ├── googleOAuth.js
│   └── paymentConfig.js
│
├── controllers/
│   ├── authControllers.js
│   ├── productControllers.js
│   ├── orderControllers.js
│   └── paymentControllers.js
│
├── helpers/
│   └── generateOrderNumber.js
│
├── middleware/
│   ├── verifyToken.js
│   ├── roleMiddleware.js
│   └── validationMiddleware.js
│
├── repository/
│   ├── productRepository.js
│   ├── orderRepository.js
|   |── userRepository.js
│   └── paymentRepository.js
│
├── services/
│   ├── authServices.js
│   ├── productServices.js
│   ├── orderServices.js
│   └── paymentServices.js
│
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   └── paymentRoutes.js
│
├── validators/
│   ├── productValidators.js
│   ├── orderValidators.js
│   
│
└── ...
│
├── prisma/
│   └── schema.prisma
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

---

## Installation

### Prerequisites

Install:

- Node.js
- Express.js
- npm
- MySQL
- Laragon
- Postman
- ngrok

### Clone Repository

```bash
git clone <repository-url>
```

### Navigate to Project

```bash
cd <project-folder>
```

### Install Dependencies

```bash
npm install
```

### Configure MySQL

Create a MySQL database through Laragon and adjust `DATABASE_URL` in `.env`.

Example:

```env
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
```

### Environment Variables

```env
PORT=3000

DATABASE_URL="mysql://username:password@localhost:3306/database_name"

JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
```

### Prisma

```bash
npx prisma migrate dev
npx prisma generate
```

### Run Application

```bash
npm run dev
```

The backend runs on localhost, for example:

```text
http://localhost:3000
```

### Run ngrok

```bash
ngrok http 3000
```

Use the generated HTTPS URL as the Midtrans Payment Notification URL.

---

## Development Environment

This project is built for local backend development.

```text
Node.js + Express.js
        ↓
Prisma ORM
        ↓
MySQL
        ↓
Laragon
```

Webhook payment:

```text
Midtrans Sandbox
        ↓
ngrok
        ↓
localhost
```

> This project does not use Docker and is not deployed.

---

## Backend Concepts

This project was built to practice and implement:

- REST API
- Google OAuth 2.0
- JWT Authentication
- Role-Based Authorization
- Middleware
- Request Validation
- Layered Architecture
- Controller Layer
- Service Layer
- Repository Layer
- Prisma ORM
- MySQL
- Database Relationships
- Database Transactions
- Product Management
- Order Processing
- Payment Gateway Integration
- Midtrans Snap
- Payment Status Mapping
- Webhook Handling
- Postman API Testing
- ngrok Webhook Testing

---

## Project Limitations

### Payment Expiration Handling

The `EXPIRED` status is available and can be processed through the expiry notification from Midtrans. However, automatic handling for the case where the payment period has expired but the backend has not yet received or processed the expiry notification is not fully implemented.

### Payment Testing

Payment testing was done using Midtrans Sandbox.

Payment methods tested:

- QRIS
- BCA Bank Transfer
- BRI Bank Transfer

Other Midtrans payment methods have not been fully tested in this version.

---

## Future Improvements

Possible improvements for future development:

- Improve payment expiration handling
- Add payment status reconciliation
- Add retry payment for failed or expired transactions
- Test additional Midtrans payment methods
- Add order history
- Add payment history
- Add automated testing
- Improve API error handling
- Add API documentation using OpenAPI / Swagger
- Production deployment
- Docker containerization
- Logging and monitoring
