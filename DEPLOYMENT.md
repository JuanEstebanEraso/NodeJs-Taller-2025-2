# Sports Betting API - Deployment Guide

## 🚀 Deploy to Render

### Prerequisites
- GitHub repository with your code
- MongoDB Atlas account (for production database)

### Step-by-Step Deployment

#### 1. Prepare Your Repository
Make sure your code is pushed to GitHub with the following structure:
```
├── src/
├── tests/
├── package.json
├── render.yaml
└── README.md
```

#### 2. Create MongoDB Atlas Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user
4. Get your connection string

#### 3. Deploy to Render
1. Go to [Render](https://render.com)
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure the service:

**Basic Settings:**
- **Name**: `sports-betting-api`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` or `dev`

**Build & Deploy:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Root Directory**: Leave empty (root)

**Environment Variables:**
- `NODE_ENV`: `production`
- `JWT_SECRET`: Generate a secure random string
- `MONGODB_URI`: Your MongoDB Atlas connection string

#### 4. Health Check
The API includes a health check endpoint at `/test-models` that Render can use to verify the service is running.

### API Endpoints

Once deployed, your API will be available at:
- **Base URL**: `https://your-app-name.onrender.com`
- **Health Check**: `GET /test-models`
- **Users**: `GET/POST /api/users`
- **Events**: `GET/POST /api/events`
- **Bets**: `GET/POST /api/bets`

### Environment Variables Required

```bash
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sports-betting
PORT=3000  # Render will set this automatically
```

### Testing Your Deployment

1. **Health Check**: `GET https://your-app.onrender.com/test-models`
2. **Create Admin User**: `GET https://your-app.onrender.com/create-db`
3. **API Endpoints**: Test your main API endpoints

### Troubleshooting

**Common Issues:**
- **Build Fails**: Check that all dependencies are in `package.json`
- **Database Connection**: Verify MongoDB URI is correct
- **Port Issues**: Make sure you're using `process.env.PORT || 3000`
- **Environment Variables**: Ensure all required env vars are set

**Logs:**
- Check Render dashboard → Your service → Logs
- Look for error messages during build or runtime

### Free Tier Limitations

Render's free tier has some limitations:
- **Sleep Mode**: App sleeps after 15 minutes of inactivity
- **Build Time**: Limited build minutes per month
- **Bandwidth**: Limited bandwidth per month

For production use, consider upgrading to a paid plan.
