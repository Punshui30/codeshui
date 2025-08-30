# 🚀 Deploying CodeShui to Netlify

CodeShui is designed to be easily deployable and shareable. Here's how to deploy it so others can use it with their own API keys or local Ollama instances.

## 🌟 **What Makes CodeShui Deployable**

- **Client-Side Only**: No server-side dependencies
- **API Key Management**: Users can add their own API keys
- **Local Ollama Support**: Works with local AI models
- **Responsive Design**: Works on all devices
- **Progressive Web App**: Can be installed as a desktop app

## 📋 **Prerequisites**

- Node.js 18+ installed
- Git repository set up
- Netlify account (free)

## 🚀 **Deployment Steps**

### 1. **Build the Project**

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

### 2. **Deploy to Netlify**

#### **Option A: Drag & Drop (Easiest)**
1. Go to [netlify.com](https://netlify.com)
2. Sign up/Login
3. Drag your `dist` folder to the deploy area
4. Your site is live! 🎉

#### **Option B: Git Integration (Recommended)**
1. Push your code to GitHub/GitLab
2. Connect your repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Deploy automatically on every push

#### **Option C: Netlify CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### 3. **Environment Configuration**

Create a `.env` file in your project root:

```env
# Optional: Default API keys (users can override)
VITE_OPENAI_API_KEY=your_openai_key_here
VITE_ANTHROPIC_API_KEY=your_anthropic_key_here
VITE_GOOGLE_API_KEY=your_google_key_here

# Ollama Configuration
VITE_OLLAMA_BASE_URL=http://localhost:11434
```

## 🔑 **User Configuration After Deployment**

### **For API Key Users:**
1. Users visit your deployed CodeShui
2. Click the "AI" button → "Settings"
3. Add their own API keys
4. Start coding with AI assistance!

### **For Local Ollama Users:**
1. Users install Ollama locally
2. Start Ollama service
3. Use CodeShui with local models
4. No API keys needed!

## 🌐 **Custom Domain (Optional)**

1. In Netlify dashboard, go to "Domain settings"
2. Add custom domain
3. Configure DNS records
4. Enable HTTPS (automatic with Netlify)

## 📱 **Progressive Web App Features**

CodeShui includes PWA features:
- Installable on desktop/mobile
- Offline capability
- App-like experience
- Automatic updates

## 🔒 **Security Considerations**

- **API Keys**: Stored locally in user's browser
- **No Server**: User data never leaves their device
- **HTTPS**: Automatic with Netlify
- **CORS**: Configured for local development

## 🚀 **Advanced Deployment Options**

### **Vercel Deployment**
```bash
npm install -g vercel
vercel --prod
```

### **GitHub Pages**
```bash
npm run build
# Push dist folder to gh-pages branch
```

### **Firebase Hosting**
```bash
npm install -g firebase-tools
firebase init hosting
firebase deploy
```

## 📊 **Analytics & Monitoring**

### **Netlify Analytics**
- Page views
- Performance metrics
- Error tracking
- User behavior

### **Custom Analytics**
Add Google Analytics or other tracking:
```html
<!-- In index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

## 🔄 **Continuous Deployment**

### **GitHub Actions Example**
```yaml
name: Deploy to Netlify
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './dist'
          production-branch: main
```

## 🌟 **Sharing Your Deployed CodeShui**

### **For Developers:**
- Share the URL
- Include setup instructions
- Document API key requirements
- Provide Ollama setup guide

### **For Teams:**
- Internal deployment
- Custom branding
- Team-specific configurations
- Shared component libraries

## 🎯 **Why This Works**

1. **No Backend Dependencies**: Everything runs in the browser
2. **API Key Flexibility**: Users manage their own keys
3. **Local AI Support**: Ollama integration for privacy
4. **Modern Architecture**: Vite + React + TypeScript
5. **Responsive Design**: Works on all devices

## 🚀 **Ready to Deploy?**

Your CodeShui is now ready for deployment! Users can:
- Add their own API keys
- Use local Ollama instances
- Build full-stack applications
- Translate components from 21st.dev
- Manage backend servers
- Use pre-built templates

Deploy it once, and let the world code with AI! 🎉
