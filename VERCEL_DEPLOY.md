# DETOMSITE Vercel Deploy

## Database

Use MongoDB Atlas for production. Create a cluster and copy the connection URI.

Backend Vercel environment variables:

```env
USE_LOCAL_DB=False
MONGODB_URL=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/detomsite?retryWrites=true&w=majority
DATABASE_NAME=detomsite
JWT_SECRET=replace-with-long-random-secret
FRONTEND_URL=https://your-frontend.vercel.app
BACKEND_URL=https://your-backend.vercel.app
DEFAULT_SUPER_ADMIN_EMAIL=12@gmail.com
DEFAULT_SUPER_ADMIN_PASSWORD=8989
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-backend.vercel.app,http://localhost:5173
REDIS_URL=redis://localhost:6379
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

Frontend Vercel environment variables:

```env
VITE_API_URL=https://your-backend.vercel.app/api/v1
```

Payment keys can stay empty until Razorpay is finished.

## Deploy Commands

Login once:

```bash
npx vercel login
```

Deploy backend from `backend/`:

```bash
npx vercel --prod
```

Deploy frontend from `frontend/`:

```bash
npx vercel --prod
```

After backend deployment, update frontend `VITE_API_URL` in Vercel to the backend URL plus `/api/v1`, then redeploy frontend.

## Notes

- The deployed `/api/v1/local/*` routes use MongoDB when `USE_LOCAL_DB=False`.
- The local machine still uses SQLite with `USE_LOCAL_DB=True`.
- The frontend has Vercel SPA rewrites, so direct page URLs like `/shops` and `/cart` work after deployment.
