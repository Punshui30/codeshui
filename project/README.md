# 🚀 CodeShui - AI-Powered Code Builder

CodeShui is a modern, AI-powered Integrated Development Environment that combines the power of multiple LLM providers with a beautiful, responsive interface.

## ✨ Features

- **🤖 Multi-LLM Support**: Connect to Ollama (local), Anthropic, OpenAI, Google AI, or custom APIs
- **📱 Mobile Responsive**: Optimized for all device sizes
- **🎨 Beautiful UI**: Golden/dark theme with smooth animations
- **💾 File Management**: Create, edit, and manage project files
- **🔧 Real-time Preview**: Live preview of your code changes
- **📚 Component Library**: AI-powered component translation and management

## 🚀 Quick Start

### Simple Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Build for Production

```bash
# Build the project
npm run build

# The dist folder is ready for deployment
```

## 🔧 LLM Configuration

### Ollama (Local)
- **URL**: `http://127.0.0.1:11434`
- **Models**: `llama3.1:8b`, `codellama`, `llama2`, `mistral`, etc.
- **Requirements**: Local Ollama server running

### Anthropic
- **URL**: `https://api.anthropic.com`
- **Models**: `claude-3-opus`, `claude-3-sonnet`, `claude-3-haiku`
- **Requirements**: API key starting with `sk-ant-`

### OpenAI
- **URL**: `https://api.openai.com/v1`
- **Models**: `gpt-4`, `gpt-4-turbo`, `gpt-3.5-turbo`
- **Requirements**: API key starting with `sk-`

### Google AI
- **URL**: `https://generativelanguage.googleapis.com`
- **Models**: `gemini-pro`, `gemini-pro-vision`, `text-bison`
- **Requirements**: API key (at least 20 characters)

## 🌐 Deployment

### Netlify (Recommended)

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   ```bash
   npm run deploy:netlify
   ```

3. **LLM Usage**:
   - **Localhost**: Full functionality with Ollama and API providers
   - **Deployed**: API key validation for external providers (Anthropic, OpenAI, Google)
   - **Ollama**: Only works from localhost (browser security limitation)

## 🔒 Security & CORS

### How It Works

CodeShui handles CORS intelligently:

- **Localhost**: Full API access for testing and development
- **Deployed Sites**: API key format validation for security
- **Ollama**: Local-only due to browser security restrictions

### Benefits

- ✅ **Simple deployment** - just drag and drop to Netlify
- ✅ **Secure API key handling** - keys validated but not exposed
- ✅ **Works everywhere** - localhost and deployed sites
- ✅ **No backend complexity** - pure frontend application

## 📱 Mobile Support

CodeShui is fully responsive with:

- **Mobile-first design** principles
- **Touch-friendly** interface elements
- **Adaptive layouts** for all screen sizes
- **Optimized navigation** for mobile devices

## 🎨 Customization

### Theme Colors

The golden/dark theme can be customized in `tailwind.config.js`:

```javascript
colors: {
  codeshui: {
    50: '#fefce8',
    500: '#eab308',
    900: '#713f12'
  }
}
```

### Logo

Replace `public/logo.svg` with your own logo to customize the branding.

## 🐛 Troubleshooting

### Connection Issues

1. **Check API keys**: Ensure they're in the correct format
2. **Verify URLs**: Make sure API endpoints are correct
3. **Localhost vs Deployed**: Ollama only works locally, external APIs work everywhere
4. **CORS errors**: These are normal for deployed sites - use localhost for full testing

### Build Issues

1. **TypeScript errors**: Run `npm run lint` to see issues
2. **Missing dependencies**: Run `npm install` to install packages
3. **Build failures**: Check for syntax errors in your code

### Performance

1. **Slow responses**: Check your LLM provider's status
2. **Large builds**: Optimize imports and remove unused code
3. **Memory issues**: Restart the development server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Ollama** for local LLM support
- **Anthropic** for Claude models
- **OpenAI** for GPT models
- **Google** for Gemini models
- **Tailwind CSS** for styling
- **React** for the UI framework

---

**Made with ❤️ by the CodeShui team**
