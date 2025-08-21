# RitoEsports Tracker

A Chrome extension for tracking League of Legends and Valorant esports schedules with real-time match updates.

## 📁 Project Structure

```
RitoEsports Tracker/
├── 📁 frontend/              # Chrome Extension (Frontend)
│   ├── 📁 src/               # TypeScript source files
│   │   ├── popup.ts          # Main popup logic
│   │   ├── styles.css        # Tailwind CSS source
│   │   └── types.ts          # TypeScript interfaces
│   ├── 📁 public/            # Static assets
│   │   ├── popup.html        # Extension popup HTML
│   │   └── manifest.json     # Chrome extension manifest
│   ├── 📁 dist/              # Compiled outputs (auto-generated)
│   │   ├── popup.js          # Compiled JavaScript
│   │   ├── style.css         # Compiled CSS
│   │   ├── popup.html        # Copied HTML
│   │   └── manifest.json     # Copied manifest
│   └── 📄 package.json       # Frontend dependencies & scripts
│
├── 📁 backend/               # AWS Infrastructure (Backend)
│   ├── 📁 lib/               # CDK infrastructure code
│   ├── 📁 lambda/            # Lambda function handlers
│   └── 📄 cdk.json           # AWS CDK configuration
│
└── 📄 README.md              # This file
```

## 🚀 Quick Start

### Frontend Development (Chrome Extension)

```bash
cd frontend

# Install dependencies
npm install

# Development with CSS watch
npm run dev

# Build for production
npm run build

# Clean build artifacts
npm run clean
```

### Backend Development (AWS Lambda)

```bash
cd backend

# Install dependencies
npm install

# Deploy to AWS
cdk deploy

# Run tests
npm test
```

## 🛠️ Development Workflow

### Frontend (Chrome Extension)

1. **Edit Source Files**: Make changes in `frontend/src/`
2. **Build**: Run `npm run build` to compile TypeScript and CSS
3. **Test**: Load `frontend/dist/` folder as unpacked extension in Chrome
4. **Deploy**: Package `frontend/dist/` contents for Chrome Web Store

### Backend (AWS Infrastructure)

1. **Edit Lambda Functions**: Modify files in `backend/lambda/`
2. **Test Locally**: Use AWS SAM or similar tools
3. **Deploy**: Run `cdk deploy` to update AWS resources

## 🔧 Build Scripts (Frontend)

- `npm run build` - Full production build
- `npm run build-css` - Compile Tailwind CSS
- `npm run build-js` - Compile TypeScript
- `npm run copy-static` - Copy static files to dist/
- `npm run dev` - Start CSS watch mode for development
- `npm run clean` - Remove dist/ folder

## 📦 Chrome Extension Installation

1. Build the frontend: `cd frontend && npm run build`
2. Open Chrome → `chrome://extensions/`
3. Enable Developer mode
4. Click "Load unpacked" → Select `frontend/dist/` folder
5. ✅ **No permission prompts!** - Extension installs cleanly

## 🎯 Key Features

- **Zero Permissions**: No scary permission warnings during installation
- **Real-time Data**: Live esports match schedules from AWS backend
- **Fast Performance**: Optimized build process and caching
- **Clean Architecture**: Separated frontend/backend concerns

## 🔒 Security & Privacy

- **No Website Access**: Extension cannot read or modify webpage data
- **API-Only Communication**: Fetches data from secure AWS Lambda endpoint
- **Local Storage**: Uses browser's local storage for caching (privacy-friendly)

## 📈 Performance Benefits

- **Permission-free installation** = Higher user adoption
- **Compiled TypeScript** = Better performance and fewer bugs  
- **Optimized CSS** = Smaller bundle size
- **Smart caching** = Faster subsequent loads

## 🏗️ Architecture

- **Frontend**: TypeScript + Tailwind CSS → Chrome Extension
- **Backend**: AWS Lambda + CDK → REST API
- **Data Source**: PandaScore API for esports schedules
- **Storage**: DynamoDB for match data persistence

---

**Ready to develop!** 🚀