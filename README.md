# CodeShui Backend Server

This is the backend server that handles LLM API proxying for CodeShui, solving CORS issues on deployed sites.

## 🚀 Quick Start

### Local Development
```bash
cd server
npm install
npm run dev
```

The server will run on `http://localhost:3001`

### Test Endpoints
- **Health Check**: `GET /health`
- **LLM Proxy**: `POST /api/llm-proxy`
- **Connection Test**: `POST /api/test-connection`

## 🌐 Deploy to Render.com (Free)

### Step 1: Push to GitHub
1. Commit and push your code to GitHub
2. Make sure the `server/` folder is included

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com) and sign up (free)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `codeshui-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free

### Step 3: Get Your URL
- Render will give you a URL like: `https://codeshui-backend-abc123.onrender.com`
- Copy this URL

### Step 4: Update Frontend
In `src/hooks/useLLM.ts`, replace:
```typescript
'https://codeshui-backend.onrender.com'
```
with your actual Render URL.

## 🔧 How It Works

1. **Frontend** sends LLM requests to the backend
2. **Backend** makes the actual API calls to Anthropic/OpenAI/Google
3. **Backend** returns the responses to the frontend
4. **No CORS issues** because backend-to-backend calls are allowed

## 🛡️ Security Features

- **API keys never logged** - only used for API calls
- **CORS properly configured** - only allows your domains
- **Input validation** - checks all required fields
- **Error handling** - gives clear feedback on failures

## 📊 Monitoring

- **Health check endpoint** for uptime monitoring
- **Console logging** for debugging
- **Error tracking** with timestamps

## 🚨 Troubleshooting

### Common Issues:
1. **Port already in use**: Change PORT in index.js
2. **CORS errors**: Check your domain is in the allowed origins
3. **API key errors**: Verify your API keys are correct
4. **Render deployment fails**: Check the build logs

### Debug Mode:
Set `NODE_ENV=development` to see detailed logs.

## 🔄 Updates

After making changes:
1. Push to GitHub
2. Render will auto-deploy
3. Update frontend with new backend URL if needed
