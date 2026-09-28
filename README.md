Payment Gateway Integration API

A backend REST API project built to learn and implement payment gateway integration using Midtrans Snap. The project focuses on backend architecture, authentication, authorization, product management, order creation, payment processing, and webhook handling.

This project was built as a local backend REST API only. It is not Dockerized and not deployed.

Tech Stack

Node.js

Express.js

Prisma ORM

MySQL

Laragon — local MySQL/database environment

Postman — API testing

Midtrans Snap — payment gateway integration

ngrok — exposes the local webhook endpoint so Midtrans can send notifications

JWT — authentication

Google OAuth — social authentication

Joi — request validation

bcryptjs — password hashing

Project Goals

The main goals of this project are to:

Build a RESTful backend API with Express.js.

Implement authentication using email/password and Google OAuth.

Implement JWT-based authentication for protected endpoints.

Apply role-based authorization for ADMIN and CUSTOMER users.

Build product management for administrators.

Build customer order creation and order-detail processing.

Integrate Midtrans Snap for payment processing.

Handle Midtrans payment notifications through a webhook.

Maintain payment and order status consistently.

Practice layered backend architecture and database transactions.

Main Features

Authentication

Register and Login with Google OAuth

JWT-based authentication.

Protected API endpoints using Bearer tokens.

Password hashing with bcryptjs.

Authorization

The application uses two roles:

ADMIN

CUSTOMER

Authorization is handled through middleware after JWT verification. Each protected route can define which roles are allowed to access it.

Product Management

Administrators can manage products through protected endpoints, while customers can access product information for ordering.

Product data includes:

Product name

Description

Price

User ownership/reference

The authenticated administrator's user ID is taken from the JWT rather than accepting user_id from the client request body.

Order Management

Customers can create orders by sending a list of products and quantities.

Example request structure:

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

The server calculates the price and subtotal values from the current product data. Clients do not submit the final order amount manually.

The order flow is:

Product → Order → Order Details → Payment

Each order receives a unique business order number such as:

ORD-20260926-8931

The order number is used as the transaction identifier sent to Midtrans, while the database primary key remains an internal ID.

Payment Gateway Integration

The project uses Midtrans Snap in Sandbox mode.

Payment creation uses the existing order data to send:

Order number

Gross amount

The API stores payment information such as:

Payment reference / transaction ID

Payment method

Payment amount

Payment status

Snap token

Redirect URL

Paid timestamp

Expired timestamp

The application also prevents duplicate payment creation for an order that already has an active pending payment and can reuse the existing Snap transaction information.

Midtrans Webhook

Midtrans notifications are handled through a dedicated webhook endpoint.

The webhook flow is approximately:

Midtrans → ngrok public URL → Express webhook endpoint → payment service → database

The notification is processed using Midtrans' transaction notification mechanism before updating local payment/order records.

Payment status mapping used by the application includes:

Midtrans status

Local payment status

Local order status

pending

PENDING

Remains PENDING

settlement

PAID

PAID

capture + accepted fraud status

PAID

PAID

capture + challenge

PENDING

Remains PENDING

expire

EXPIRED

EXPIRED

cancel / deny / failure

FAILED

FAILED

Payment and order updates are performed inside a database transaction so the two records remain consistent when a webhook is processed.

Backend Architecture

The project follows a layered structure to separate responsibilities between application layers.

Request
  ↓
Route
  ↓
Validation Middleware
  ↓
Authentication Middleware
  ↓
Authorization Middleware
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Prisma ORM
  ↓
MySQL

Layer Responsibilities

Route

Defines API endpoints and middleware order.

Validation Middleware

Validates incoming request data.

Provides validated data to later layers.

Authentication Middleware

Verifies JWT tokens.

Stores authenticated user information in req.user.

Authorization Middleware

Checks whether the authenticated user's role is allowed for the requested route.

Controller

Handles HTTP requests and responses.

Passes validated/authenticated data to services.

Service

Contains business logic.

Calculates order totals.

Validates product availability/existence for order creation.

Coordinates payment processing and database transactions.

Repository

Handles database access through Prisma.

Keeps database queries separated from business logic.

Prisma ORM

Provides database access and transaction support.

Database Overview

The main database areas include:

Users

UserAccounts

Products

Orders

OrderDetails

Payments

The authentication structure separates the main user identity from authentication/account information, allowing a user to have multiple authentication methods such as local login and Google OAuth.

The payment structure uses a one-to-one relationship between an order and its payment record.

Authentication and Authorization Flow

Customer/Admin Authentication

Register/Login
    ↓
Authentication
    ↓
JWT generated
    ↓
Client sends Bearer Token
    ↓
verifyToken
    ↓
req.user
    ↓
roleMiddleware
    ↓
Authorized route

Public endpoints such as registration and login do not require JWT authentication.

Protected endpoints use JWT verification followed by role authorization when required.

Payment Flow

1. Customer creates an order
        ↓
2. Order status = PENDING
        ↓
3. Customer creates a payment
        ↓
4. Backend sends transaction data to Midtrans Snap
        ↓
5. Snap token / redirect URL returned
        ↓
6. Customer continues payment through Midtrans
        ↓
7. Midtrans sends payment notification
        ↓
8. Backend validates and processes the notification
        ↓
9. Payment status is updated
        ↓
10. Order status is updated when required

Local Setup

1. Clone the repository

git clone <your-repository-url>
cd <your-project-folder>

2. Install dependencies

npm install

3. Prepare MySQL

Create the project database using the MySQL environment provided by Laragon.

4. Configure environment variables

Create a .env file and provide the required values for:

PORT=3000
DATABASE_URL=<your-mysql-database-url>
JWT_SECRET=<your-jwt-secret>
SERVER_KEY=<your-midtrans-server-key>
CLIENT_KEY=<your-midtrans-client-key>

Add any additional OAuth environment variables required by the Google OAuth implementation.

Do not commit .env to the repository.

5. Run Prisma migrations

Use the Prisma migration workflow configured by the project to create/update the database schema.

6. Start the API

npm run dev

or use the project's configured start command.

The API runs locally, for example:

http://localhost:3000

Testing with Postman

Postman is used to test the REST API flow.

Recommended testing sequence:

1. Register user
2. Login
3. Receive JWT
4. Use Bearer Token for protected requests
5. Test admin product endpoints with an ADMIN account
6. Test customer product/order endpoints with a CUSTOMER account
7. Create an order
8. Create a payment for the order
9. Open the Midtrans Snap redirect URL
10. Complete a Sandbox payment
11. Observe the webhook request
12. Verify payment/order records in MySQL

Local Webhook Testing with ngrok

Because the backend is running on localhost, Midtrans cannot directly access the webhook endpoint without a public URL.

Start ngrok with the local API port:

ngrok http 3000

Use the generated HTTPS public URL as the Midtrans Payment Notification URL, followed by the project's webhook route.

Example:

https://<ngrok-id>.ngrok-free.app/<your-webhook-route>

Keep the Node.js server and ngrok process running while testing payment notifications.

Payment Methods Tested

The Midtrans Sandbox integration was tested successfully with:

QRIS

BCA bank transfer

BRI bank transfer

These tests were performed in the Midtrans Sandbox environment.

Current Limitations

This project is intentionally focused on learning and implementing the core backend payment flow. The current version still has some limitations:

Payment expiry handling is not fully automated for every expiry scenario.

The project has only been tested with selected Midtrans Sandbox payment methods.

The API is not deployed to a production server.

The project is not containerized with Docker.

Order number generation currently uses a random numeric suffix, so collision handling is delegated to the database unique constraint.

Future Improvements

Possible future improvements include:

More complete payment expiry and retry handling.

Additional Midtrans payment methods.

Payment status reconciliation using transaction status checks.

More robust order number generation.

Automated tests.

Production deployment.

Docker support.

Improved error handling and logging.

Project Status

Completed — Backend REST API Payment Gateway Integration

The core payment gateway flow has been implemented and tested locally using Midtrans Sandbox, Postman, MySQL, and ngrok.

This project is currently kept as a local backend portfolio/learning project and can be extended in the future when additional payment and production requirements are needed.