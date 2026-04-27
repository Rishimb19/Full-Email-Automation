

```markdown
# MailForge - AI Email Campaign Platform

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/Node.js-22.x-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express" />
  <img src="https://img.shields.io/badge/Prisma-5.22-blue?style=for-the-badge&logo=prisma" />
  <img src="https://img.shields.io/badge/Groq-AI-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
</div>

<br/>

**MailForge** is a full-stack email campaign platform that uses **Groq AI** to generate personalized emails, validates email addresses, and sends bulk campaigns via Gmail. Perfect for marketers, sales teams, and businesses looking to automate email outreach.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🤖 AI-Powered Email Generation
- **Groq AI Integration** - Free and fast email generation
- **Smart Field Suggestions** - AI suggests personalization fields based on subject
- **Dynamic Personalization** - Support for custom fields like `{{toName}}`, `{{companyName}}`
- **Tone Control** - Formal or casual tone
- **Regeneration** - Improve emails with feedback

### 📊 Campaign Management
- **Bulk Email Sending** - Send up to 5 emails per batch (Gmail rate limit)
- **CSV/Excel Import** - Bulk upload recipients with custom fields
- **Email Validation** - Free email validation before sending
- **Real-time Tracking** - Track sent, failed, invalid, and skipped emails
- **Campaign Results** - Detailed per-recipient delivery status

### 🔐 Authentication
- **Google Sign-In** - One-click authentication
- **Email/Password** - Traditional sign-up/login
- **JWT Tokens** - Secure session management
- **Gmail OAuth** - Connect Gmail account to send emails

### 📝 Template Management
- **Save Templates** - Reuse successful email templates
- **Template Library** - Browse and manage saved templates

### 🎨 Modern UI
- **Dark Theme** - Eye-friendly design
- **Responsive** - Works on all devices
- **Step-by-Step Flow** - Guided campaign creation
- **Real-time Feedback** - Toast notifications

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2 | React framework |
| React | 18 | UI library |
| Tailwind CSS | 3.4 | Styling |
| Axios | 1.6 | HTTP client |
| React Hot Toast | 2.4 | Notifications |
| Lucide React | 0.358 | Icons |
| React Dropzone | 14.2 | File upload |
| @react-oauth/google | latest | Google Sign-In |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 22.x | Runtime |
| Express | 5.x | Web framework |
| Prisma | 5.22 | ORM |
| SQLite | - | Development DB |
| PostgreSQL | - | Production DB |
| JWT | 9.x | Authentication |
| Bcrypt | 5.x | Password hashing |
| Groq SDK | latest | AI integration |
| Google APIs | latest | Gmail & OAuth |
| Multer | 1.4 | File upload |
| Nodemailer | 6.9 | Email (fallback) |

## 📁 Project Structure

```
mailforge/
├── email-saas-backend/               # Backend application
│   ├── prisma/
│   │   └── schema.prisma            # Database schema
│   ├── src/
│   │   ├── ai/
│   │   │   └── emailGenerator.js    # Groq AI integration
│   │   ├── controllers/
│   │   │   ├── authController.js    # Email/password auth
│   │   │   ├── campaignController.js
│   │   │   ├── generateController.js
│   │   │   ├── googleSignInController.js
│   │   │   ├── gmailSendController.js
│   │   │   ├── recipientsController.js
│   │   │   ├── templateController.js
│   │   │   └── validateController.js
│   │   ├── middlewares/
│   │   │   └── auth.js              # JWT verification
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── campaignRoutes.js
│   │   │   ├── generateRoutes.js
│   │   │   ├── gmailSendRoutes.js
│   │   │   ├── googleSignInRoutes.js
│   │   │   ├── recipientsRoutes.js
│   │   │   ├── sendRoutes.js
│   │   │   ├── templateRoutes.js
│   │   │   └── validateRoutes.js
│   │   ├── services/
│   │   │   └── emailSender.js      # Gmail sending logic
│   │   ├── uploads/                 # Temporary file storage
│   │   ├── app.js
│   │   └── server.js
│   ├── .env
│   └── package.json
│
├── email-saas-frontend/              # Frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── campaigns/
│   │   │   │   └── [id]/
│   │   │   │       └── page.js     # Campaign results
│   │   │   ├── compose/
│   │   │   │   └── page.js         # Email composer
│   │   │   ├── dashboard/
│   │   │   │   └── page.js         # User dashboard
│   │   │   ├── gmail-callback/
│   │   │   │   └── page.js         # OAuth callback
│   │   │   ├── login/
│   │   │   │   └── page.js         # Login/Register
│   │   │   ├── settings/
│   │   │   │   └── page.js         # Gmail settings
│   │   │   ├── templates/
│   │   │   │   └── page.js         # Template manager
│   │   │   ├── globals.css
│   │   │   ├── layout.js
│   │   │   └── page.js
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── RecipientsStep.js
│   │   │   └── StepBar.js
│   │   ├── context/
│   │   │   └── AuthContext.js      # Auth state management
│   │   └── lib/
│   │       └── api.js              # API client
│   ├── .env.local
│   └── package.json
│
├── .gitignore
└── README.md
```

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18 or higher
- **npm** or **yarn** package manager
- **Git** for version control
- **Groq API Key** (free) - [Get from console.groq.com](https://console.groq.com/keys)
- **Google Cloud Project** with OAuth 2.0 credentials

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/mailforge.git
cd mailforge
```

### 2. Backend Setup

```bash
cd email-saas-backend
npm install
```

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="file:./dev.db"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-to-random-string"
JWT_EXPIRES_IN="7d"

# Bcrypt
BCRYPT_ROUNDS=10

# Groq AI (Free)
GROQ_API_KEY="your-groq-api-key-here"

# Google OAuth (Same for Sign-In and Gmail)
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/gmail-callback"
```

Initialize database:

```bash
npx prisma generate
npx prisma db push
```

### 3. Frontend Setup

```bash
cd ../email-saas-frontend
npm install
```

Create `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
```

## 🚀 Running the Application

### Start Backend Server

```bash
cd email-saas-backend
npm run dev
```

Backend runs at `http://localhost:3001`

### Start Frontend Server

```bash
cd email-saas-frontend
npm run dev
```

Frontend runs at `http://localhost:3000`

### Access the Application

1. Open browser to `http://localhost:3000`
2. Create an account or sign in with Google
3. Go to Settings → Connect Gmail Account
4. Create your first campaign!

## ⚙️ Configuration

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable APIs:
   - **Gmail API**
   - **People API**
4. Configure OAuth consent screen:
   - User Type: External
   - App name: MailForge
   - Scopes: `email`, `profile`, `openid`, `gmail.send`
   - Test users: Add your email
5. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/gmail-callback`
   - Copy Client ID and Secret

### Groq API Setup

1. Go to [Groq Console](https://console.groq.com/keys)
2. Sign up for free account
3. Create API key
4. Copy key to `.env` file

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | `{name, email, password}` | Create account |
| POST | `/api/auth/login` | `{email, password}` | Login |
| POST | `/api/auth/google` | `{credential}` | Google Sign-In |
| GET | `/api/auth/me` | - | Get current user |

### Template Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/templates` | List all templates |
| POST | `/api/templates` | Create template |
| GET | `/api/templates/:id` | Get template |
| PUT | `/api/templates/:id` | Update template |
| DELETE | `/api/templates/:id` | Delete template |

### AI Generation Endpoints

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/generate/suggest-fields` | `{subject}` | AI field suggestions |
| POST | `/api/generate/email-body` | `{subject, tone, selectedFields, fieldValues}` | Generate email |
| POST | `/api/generate/regenerate` | `{previousBody, subject, tone, feedback}` | Regenerate |

### Campaign Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/campaigns` | List campaigns |
| POST | `/api/campaigns` | Create campaign |
| GET | `/api/campaigns/:id` | Get campaign |
| PUT | `/api/campaigns/:id` | Update campaign |
| DELETE | `/api/campaigns/:id` | Delete campaign |

### Recipient Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/recipients/parse-file` | Upload CSV/Excel file |
| POST | `/api/recipients/validate-fields` | Validate recipient fields |

### Email Validation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/validate/emails` | Validate multiple emails |
| POST | `/api/validate/single` | Validate single email |

### Gmail Integration

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gmail/auth-url` | Get OAuth URL |
| POST | `/api/gmail/save-tokens` | Save OAuth tokens |
| GET | `/api/gmail/status` | Check connection status |
| POST | `/api/gmail/disconnect` | Disconnect Gmail |

### Send Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/send/campaign/:id` | Send campaign |
| GET | `/api/send/campaign/:id/results` | Get campaign results |

## 🚢 Deployment

### Deploy on Render

#### Backend Deployment

1. Push code to GitHub repository
2. Log into [Render](https://render.com)
3. Click **New +** → **Web Service**
4. Connect your GitHub repository
5. Configure:
   - **Name**: `mailforge-backend`
   - **Root Directory**: `email-saas-backend`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
6. Add environment variables (from your `.env` file)
7. Click **Create Web Service**

#### Frontend Deployment

1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `mailforge-frontend`
   - **Root Directory**: `email-saas-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: `https://mailforge-backend.onrender.com/api`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: your Google Client ID
5. Click **Create Web Service**

### Production Database

For production, replace SQLite with PostgreSQL:

1. Create PostgreSQL database on Render
2. Update `DATABASE_URL` environment variable
3. Run migrations: `npx prisma migrate deploy`

## 🔧 Troubleshooting

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **Port already in use** | Change PORT in `.env` or kill process using the port |
| **Database connection error** | Check `DATABASE_URL` and ensure SQLite file is writable |
| **Gmail connection fails** | Verify Google OAuth credentials and redirect URI |
| **Groq API quota exceeded** | Check Groq console for usage limits |
| **CORS errors** | Update CORS origin in backend `app.js` |
| **JWT expired** | User needs to login again |
| **Email sending fails** | Verify Gmail is connected and tokens are valid |

### Logs

- **Backend logs**: Terminal running `npm run dev`
- **Frontend logs**: Browser console (F12)
- **Database logs**: `npx prisma studio`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Update documentation as needed
- Test thoroughly before submitting

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- **[Groq](https://groq.com)** - Free, fast AI inference
- **[Google Cloud Platform](https://cloud.google.com)** - OAuth & Gmail API
- **[Next.js](https://nextjs.org)** - React framework
- **[Prisma](https://prisma.io)** - Database ORM
- **[Render](https://render.com)** - Hosting platform
- **[Tailwind CSS](https://tailwindcss.com)** - Styling

## 📧 Contact

- **Issues**: [GitHub Issues](https://github.com/yourusername/mailforge/issues)
- **Email**: support@mailforge.com

## ⭐ Show Your Support

If you found this project helpful, please give it a ⭐ on GitHub!

---

<div align="center">
  Made with ❤️ using Groq AI and Gmail API
</div>
