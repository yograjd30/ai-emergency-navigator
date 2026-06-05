# SOS Nav — AI Emergency Government Navigator

> **"The right help. Right now."**

An AI-powered emergency assistance platform that instantly triages emergencies, identifies correct government helplines, provides step-by-step official procedures, and shows nearby emergency services — supporting 10 Indian languages with offline access.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + TypeScript + Tailwind CSS v3 |
| **Backend** | Node.js + Express.js + MongoDB (Mongoose) |
| **AI/NLP** | Google Gemini 2.0 Flash |
| **Maps** | Leaflet.js + OpenStreetMap (Overpass API) |
| **Auth** | Google OAuth 2.0 (Passport.js) |
| **PWA** | vite-plugin-pwa (offline helpline access) |

## 📁 Project Structure

```
/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── seed/
│   │   └── lib/
│   └── package.json
├── frontend/         # React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── types/
│   │   ├── i18n/
│   │   └── lib/
│   └── package.json
└── README.md
```

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google Cloud Console project (OAuth + Gemini API key)

### Backend
```bash
cd backend
cp .env.example .env
# Fill in your env vars
npm install
npm run seed   # Seed helpline & procedure data
npm start
```

### Frontend
```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL
npm install
npm run dev
```

## 🔑 Environment Variables

### Backend (.env)
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `SESSION_SECRET` | Random secret for session encryption |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL |
| `FRONTEND_URL` | Frontend URL for CORS |
| `GEMINI_API_KEY` | Google Gemini API key |
| `NODE_ENV` | `development` or `production` |

### Frontend (.env)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |
| `VITE_APP_NAME` | App name (SOS Nav) |

## 🌐 Supported Languages
English, Hindi, Tamil, Telugu, Bengali, Marathi, Kannada, Malayalam, Gujarati, Punjabi

## 📞 Emergency Helplines Covered
40+ verified Indian emergency helplines across: Police, Fire, Ambulance, Women Safety, Child Protection, Cybercrime, Disaster Management, Mental Health, Senior Citizens, and more.

## 📄 License
MIT
