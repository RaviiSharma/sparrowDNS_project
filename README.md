# 🦅 Sparrow DNS

A comprehensive DNS management platform powered by PowerDNS, featuring analytics, security monitoring, integrations, and reseller capabilities.

## ✨ Features

### Core DNS Management

- **Zone Management**: Create, edit, delete DNS zones with full control
- **Record Management**: Support for all DNS record types (A, AAAA, CNAME, MX, TXT, NS, SOA, etc.)
- **Bulk Operations**: Import zones, delete multiple records at once
- **Domain Transfer**: Transfer domains between users
- **Custom Nameservers**: White-label nameserver support

### Analytics & Monitoring

- **Real-time Analytics**: Query statistics, performance metrics, geographic distribution
- **Health Monitoring**: Platform and server status monitoring
- **Activity Logs**: Comprehensive audit trail of all DNS operations
- **Usage Tracking**: Monitor queries, zones, and resource consumption

### Security

- **Security Logs**: Track login attempts, API key usage, suspicious activities
- **Security Score**: Automated security posture assessment
- **Event Types**: Login/logout, password changes, 2FA events, API key operations
- **IP & Location Tracking**: Monitor access patterns

### Integrations

- **Webhooks**: Event-driven notifications for zone/record changes
- **HMAC Signing**: Secure webhook payload verification
- **Delivery Tracking**: Monitor webhook success/failure rates
- **Multiple Events**: zone.created, record.updated, health.alert, domain.expiring

### Reseller Program

- **White-label Capabilities**: Custom nameservers and branding
- **Multi-tenant Support**: Manage multiple client accounts
- **Usage Limits**: Configurable zones, queries, and tenant limits
- **Revenue Tracking**: Monitor reseller performance

### Billing & Subscriptions

- **Multiple Plans**: Free, Basic, Pro, Business, Enterprise
- **Razorpay Integration**: Secure payment processing
- **Usage Metering**: Track API calls, zones, queries
- **Subscription Management**: Upgrade, downgrade, cancel anytime

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **DNS Server**: PowerDNS API integration
- **Authentication**: JWT with cookie-based sessions
- **Payment**: Razorpay payment gateway
- **Email**: Nodemailer with SMTP
- **Validation**: Express-validator
- **Security**: Helmet, CORS, rate limiting

### Frontend

- **Framework**: Next.js 15.5.6 with React 19
- **Build Tool**: Turbopack
- **State Management**: Redux Toolkit with RTK Query
- **UI Components**: Shadcn/ui with Radix UI
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB 5.0+ (local or MongoDB Atlas)
- PowerDNS server with API enabled
- Razorpay account (for billing)
- SMTP server (for emails)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/sparrow_dns.git
cd sparrow_dns
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in `backend/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/sparrow_dns
# or MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/sparrow_dns

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# PowerDNS API
POWERDNS_API_URL=http://localhost:8081/api/v1
POWERDNS_API_KEY=your_powerdns_api_key

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@sparrowdns.com
FROM_NAME=Sparrow DNS

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env.local` file in `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## ▶️ Running the Application

### Development Mode

**Start Backend** (Terminal 1):

```bash
cd backend
npm run dev
```

Server runs on: http://localhost:5000

**Start Frontend** (Terminal 2):

```bash
cd frontend
npm run dev
```

App runs on: http://localhost:3000

### Production Mode

**Backend**:

```bash
cd backend
npm start
```

**Frontend**:

```bash
cd frontend
npm run build
npm start
```

## 📁 Project Structure

```
sparrow_dns/
├── backend/
│   ├── src/
│   │   ├── config/           # Database, rate limiter, Razorpay config
│   │   ├── controllers/      # Business logic for all features
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API endpoints
│   │   ├── middleware/       # Auth, API key, admin checks
│   │   ├── services/         # External services (PowerDNS, email, WHOIS)
│   │   ├── cron/             # Scheduled jobs
│   │   └── app.js            # Express app entry point
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── app/                  # Next.js pages and layouts
│   │   ├── (website)/        # Main dashboard pages
│   │   ├── login/            # Authentication
│   │   └── signup/
│   ├── components/           # Reusable React components
│   │   ├── ui/               # Shadcn/ui components
│   │   ├── dashboard-comps/  # Dashboard-specific components
│   │   ├── auth/             # Login/signup forms
│   │   └── ...
│   ├── store/                # Redux store
│   │   ├── api/              # RTK Query API slices
│   │   └── index.ts          # Store configuration
│   ├── lib/                  # Utilities and helpers
│   ├── package.json
│   └── .env.local
│
└── README.md
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### DNS Management

- `GET /api/dns/zones` - List all zones
- `POST /api/dns/zones` - Create zone
- `GET /api/dns/zones/:id` - Get zone details
- `DELETE /api/dns/zones/:id` - Delete zone
- `POST /api/dns/records` - Add record
- `PUT /api/dns/records/:id` - Update record
- `DELETE /api/dns/records/:id` - Delete record

### Analytics

- `GET /api/analytics/overview` - Dashboard overview
- `GET /api/analytics/queries` - Query analytics
- `GET /api/analytics/performance` - Performance metrics
- `GET /api/analytics/geographic` - Geographic distribution

### Security

- `GET /api/security/logs` - Security event logs
- `GET /api/security/overview` - Security score and overview
- `POST /api/security/logs` - Log security event

### Integrations

- `GET /api/integrations/webhooks` - List webhooks
- `POST /api/integrations/webhooks` - Create webhook
- `PUT /api/integrations/webhooks/:id` - Update webhook
- `DELETE /api/integrations/webhooks/:id` - Delete webhook
- `POST /api/integrations/webhooks/:id/test` - Test webhook

### Resellers

- `GET /api/reseller` - List all resellers (admin)
- `POST /api/reseller` - Create reseller (superadmin)
- `GET /api/reseller/stats` - Reseller statistics
- `PUT /api/reseller/:id` - Update reseller
- `DELETE /api/reseller/:id` - Delete reseller (superadmin)

### Billing

- `GET /api/billing/plan` - Current subscription
- `POST /api/billing/plan/create-order` - Create payment order
- `POST /api/billing/plan/verify-payment` - Verify payment
- `GET /api/billing/usage` - Usage statistics
- `POST /api/billing/cancel` - Cancel subscription

## 🔐 Authentication

The platform supports multiple authentication methods:

1. **JWT Tokens**: Cookie-based session management
2. **API Keys**: For programmatic access
3. **Role-based Access**: User, Admin, Superadmin roles

### Middleware Chain

- `authOrApiKey`: Accept either JWT or API key
- `isAuth`: Require JWT authentication
- `isAdmin`: Require admin role
- `isSuperadmin`: Require superadmin role
- `checkScope`: Validate API key permissions

## 🌐 Environment Variables

### Backend Required Variables

| Variable              | Description               | Example                                 |
| --------------------- | ------------------------- | --------------------------------------- |
| `PORT`                | Server port               | `5000`                                  |
| `MONGO_URI`           | MongoDB connection string | `mongodb://localhost:27017/sparrow_dns` |
| `JWT_SECRET`          | JWT signing key           | `your-secret-key`                       |
| `POWERDNS_API_URL`    | PowerDNS API endpoint     | `http://localhost:8081/api/v1`          |
| `POWERDNS_API_KEY`    | PowerDNS API key          | `your-api-key`                          |
| `RAZORPAY_KEY_ID`     | Razorpay public key       | `rzp_test_xxx`                          |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key       | `your-secret`                           |

### Frontend Required Variables

| Variable              | Description     | Example                     |
| --------------------- | --------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` |

## 📊 Database Models

- **User**: User accounts with roles and subscriptions
- **Zone**: DNS zones managed through PowerDNS
- **ActivityLog**: Audit trail of user actions
- **Stats**: Platform-wide statistics
- **ZoneStats**: Per-zone query statistics
- **Reseller**: Reseller account configurations
- **Webhook**: Integration webhook endpoints
- **SecurityLog**: Security event tracking
- **ApiKey**: API key management
- **MonitoredDomain**: Domain monitoring configuration
- **Invoice**: Billing invoices
- **Order**: Payment orders
- **Plan**: Subscription plans

## 🔄 Development Workflow

### Adding New Features

1. **Backend**: Create model → controller → routes → register in app.js
2. **Frontend**: Create RTK Query slice → add to store → build UI components
3. **Testing**: Test API endpoints → connect frontend → verify data flow

### Code Style

- Backend: ES6+ with imports, async/await
- Frontend: TypeScript with strict mode, functional components
- Naming: camelCase for variables, PascalCase for components

## 🐛 Common Issues

### Backend won't start

- Check MongoDB connection string
- Verify PowerDNS API is accessible
- Ensure all environment variables are set

### Frontend won't build

- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run type-check`

### Deprecation warnings

MongoDB driver warnings about `useNewUrlParser` and `useUnifiedTopology` are harmless and can be ignored (MongoDB driver v4.0+ doesn't use these options).

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request


