# DETOMSITE V3.1 - Enterprise Campus Food Ordering Platform

Production-ready enterprise platform for campus food ordering and delivery.

## 🎯 Features

- **Multi-Campus Support**: Isolated tenants with complete data separation
- **User Roles**: Customers, Shopkeepers, Admins, Super Admins, Delivery Partners
- **Real-Time Updates**: WebSocket support for live order tracking
- **Payment Integration**: Razorpay + Manual UTR verification
- **Analytics Dashboard**: Comprehensive insights for all user levels
- **Audit Logging**: Complete compliance and security logging
- **PWA**: Offline support and installable app

## 🏗️ Tech Stack

### Frontend
- React 19 with TypeScript
- Vite build tool
- Tailwind CSS + ShadCN UI
- Three.js campus ordering scene
- Zustand state management
- React Router v7
- TanStack Query
- Framer Motion

### Backend
- FastAPI
- Python 3.12+
- MongoDB with Beanie ODM
- SQLite local development API
- Redis caching
- Pydantic v2

### Infrastructure
- Docker & Docker Compose
- Vercel (deployment)
- MongoDB Atlas
- Upstash Redis

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- Docker & Docker Compose for the full production-style stack
- MongoDB/Redis only when `USE_LOCAL_DB=False`

### Setup

1. **Clone repository**
```bash
git clone <repository>
cd detomsite
```

2. **Backend Setup**
```bash
cd backend
cp .env.example .env
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements-local.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

3. **Frontend Setup**
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev -- --host 0.0.0.0
```

4. **Docker Compose (Production-style stack)**
```bash
docker-compose up --build
```

This will start:
- MongoDB (port 27017)
- Redis (port 6379)
- Backend (port 8001 for the local SQLite API)
- Frontend (port 5173)

## 📚 API Documentation

After starting backend, visit:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc
- **OpenAPI JSON**: http://localhost:8001/openapi.json

## 🔐 Environment Variables

### Backend (.env)
```
MONGODB_URL=mongodb+srv://...
USE_LOCAL_DB=True
LOCAL_DB_PATH=detomsite_local.db
REDIS_URL=redis://...
SECRET_KEY=your-secret-key
DEFAULT_SUPER_ADMIN_EMAIL=admin@detomsite.local
DEFAULT_SUPER_ADMIN_PASSWORD=change-me-before-use-123
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8001/api/v1
VITE_RAZORPAY_KEY_ID=...
```

## 📁 Project Structure

```
detomsite/
├── backend/
│   ├── app/
│   │   ├── api/v1/           # API endpoints
│   │   ├── models/           # Database models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   ├── core/             # Config, security, database
│   │   └── middleware/       # ASGI middleware
│   ├── tests/                # Test suite
│   ├── main.py              # Entry point
│   └── requirements.txt      # Dependencies
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── store/           # Zustand store
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utilities
│   ├── public/              # Static assets
│   └── package.json         # Dependencies
├── docker-compose.yml        # Local development
└── .github/workflows/        # CI/CD pipelines
```

## 🧪 Testing

### Backend
```bash
cd backend
pytest tests/ --cov=app
```

### Frontend
```bash
cd frontend
npm test
```

## 📦 Deployment

### Vercel (Frontend)
```bash
# Connected repository auto-deploys to Vercel
```

### Vercel Python Runtime (Backend)
```bash
# Deploy configuration in vercel.json
```

## 🔑 Admin Setup

Local development starts with `USE_LOCAL_DB=True`, which uses the built-in SQLite demo data and does not require a default login. For MongoDB production mode, set your own `DEFAULT_SUPER_ADMIN_EMAIL` and `DEFAULT_SUPER_ADMIN_PASSWORD` in `.env` before first startup.

## 📋 Development Roadmap

- [x] Project Structure
- [x] Database Models
- [ ] Authentication System
- [ ] Campus System
- [ ] Shop System
- [ ] Product System
- [ ] Cart System
- [ ] Orders System
- [ ] Razorpay Integration
- [ ] Notifications System
- [ ] Admin Dashboard
- [ ] Super Admin Dashboard
- [ ] Analytics
- [ ] Reviews System
- [ ] Support Tickets
- [ ] PWA Setup
- [ ] Deployment

## 🐛 Contributing

1. Create feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open Pull Request

## 📝 License

Proprietary - All rights reserved

## 📧 Support

For issues and support, contact: support@detomsite.com

---

**DETOMSITE V3.1** - Enterprise Campus Food Ordering Platform
