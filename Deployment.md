# Deployment Guide - US-018

## 📋 Prerequisites

- MongoDB Atlas account
- Render account (for backend)
- Netlify account (for frontend)
- UptimeRobot account (for monitoring)
- GitHub repository

---

## 🗄️ AC1: Backend Deployment (Render + MongoDB Atlas)

### Step 1: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier is fine)
3. Create a database user with username/password
4. Whitelist IP: `0.0.0.0/0` (allow from anywhere)
5. Get your connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/nexacore?retryWrites=true&w=majority
   ```

### Step 2: Deploy Backend to Render

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Configure:
   - **Name**: `nexacore-backend`
   - **Root Directory**: leave empty (or set to root)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

6. **Add Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   PORT=3000
   CORS_ORIGIN=<your-netlify-frontend-url>
   ```

7. Click **"Create Web Service"**
8. Wait for deployment (~5 minutes)
9. Your backend URL: `https://nexacore-backend.onrender.com`

### Step 3: Test Backend Health

```bash
curl https://nexacore-backend.onrender.com/api/health
```

Expected response:
```json
{
  "uptime": 123.45,
  "timestamp": 1699564231847,
  "status": "OK",
  "environment": "production",
  "database": "connected"
}
```

---

## 🎨 AC2: Frontend Deployment (Netlify)

### Step 1: Prepare Frontend

1. In your `frontend` directory, create `.env.production`:
   ```bash
   REACT_APP_API_URL=https://nexacore-backend.onrender.com
   ```

2. Test locally:
   ```bash
   cd frontend
   npm run build
   ```

### Step 2: Deploy to Netlify

**Option A: Netlify CLI (Recommended)**

```bash
npm install -g netlify-cli
cd frontend
netlify login
netlify init
netlify deploy --prod
```

**Option B: Netlify Dashboard**

1. Go to [Netlify](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub repository
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`
   
5. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://nexacore-backend.onrender.com
   ```

6. Deploy!
7. Your frontend URL: `https://nexacore-frontend.netlify.app`

### Step 3: Update CORS on Backend

Go back to Render and update the `CORS_ORIGIN` environment variable:
```
CORS_ORIGIN=https://nexacore-frontend.netlify.app
```

---

## 📊 AC3: Monitoring Setup (UptimeRobot)

### Step 1: Create UptimeRobot Account

1. Go to [UptimeRobot](https://uptimerobot.com/)
2. Sign up for free account (50 monitors included)

### Step 2: Add Backend Monitor

1. Click **"+ Add New Monitor"**
2. Configure:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: NexaCore Backend
   - **URL**: `https://nexacore-backend.onrender.com/api/health`
   - **Monitoring Interval**: 5 minutes
   - **Alert Contacts**: Your email

3. Click **"Create Monitor"**

### Step 3: Add Frontend Monitor

1. Click **"+ Add New Monitor"**
2. Configure:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: NexaCore Frontend
   - **URL**: `https://nexacore-frontend.netlify.app`
   - **Monitoring Interval**: 5 minutes
   - **Alert Contacts**: Your email

3. Click **"Create Monitor"**

### Step 4: Set Up Status Page (Optional)

1. In UptimeRobot, go to **"Public Status Pages"**
2. Click **"Add Status Page"**
3. Select your monitors
4. Get public URL: `https://stats.uptimerobot.com/xxxxx`

---

## 🧪 Testing Deployment

### Test Backend

```bash
# Health check
curl https://nexacore-backend.onrender.com/api/health

# Status check
curl https://nexacore-backend.onrender.com/api/status

# Upload test (from frontend)
# Use the frontend UI to upload a file

# Search test
curl "https://nexacore-backend.onrender.com/api/search?q=database"
```

### Test Frontend

1. Open `https://nexacore-frontend.netlify.app`
2. Upload a test file
3. Search for a term
4. Verify results display correctly

---

## 📈 Monitoring Endpoints

| Endpoint | Purpose | Expected Response |
|----------|---------|-------------------|
| `/api/health` | Quick health check | 200 OK with uptime |
| `/api/status` | Detailed status | Service metrics |
| Frontend URL | UI availability | HTML page loads |

---

## 🚨 Troubleshooting

### Backend Issues

**Problem**: 503 Database disconnected
```bash
# Check MongoDB Atlas:
# 1. Verify IP whitelist includes 0.0.0.0/0
# 2. Check connection string is correct
# 3. Verify database user credentials
```

**Problem**: CORS errors
```bash
# Update CORS_ORIGIN in Render:
CORS_ORIGIN=https://nexacore-frontend.netlify.app
```

### Frontend Issues

**Problem**: API calls failing
```bash
# Check .env.production:
REACT_APP_API_URL=https://nexacore-backend.onrender.com

# Rebuild and redeploy:
npm run build
netlify deploy --prod
```

---

## ✅ Acceptance Criteria Verification

### AC1: Backend hosted on Render with MongoDB Atlas
- ✅ Backend deployed to Render
- ✅ MongoDB Atlas connected
- ✅ Health endpoint responding

### AC2: Frontend deployed on Netlify
- ✅ Frontend deployed to Netlify
- ✅ Connects to backend API
- ✅ All features working

### AC3: Monitoring with UptimeRobot
- ✅ UptimeRobot monitors set up
- ✅ Health checks every 5 minutes
- ✅ Email alerts configured
- ✅ Logs accessible via Render/Netlify dashboards

---

## 📝 URLs Reference

```bash
# Production URLs
Backend:  https://nexacore-backend.onrender.com
Frontend: https://nexacore-frontend.netlify.app
Status:   https://stats.uptimerobot.com/xxxxx

# API Endpoints
Health:   https://nexacore-backend.onrender.com/api/health
Status:   https://nexacore-backend.onrender.com/api/status
Upload:   https://nexacore-backend.onrender.com/api/upload
Search:   https://nexacore-backend.onrender.com/api/search
```

---

## 🎉 Deployment Complete!

Your NexaCore Search Indexing Service is now live and monitored!