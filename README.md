# 🌱 BioLesson - Lesson Plan Generator

A web application for biology teachers in low-resource regions that generates structured, classroom-ready lesson plans from simple prompts.

## 🎯 Features (Phase 1)

- **AI-Powered Generation**: Create complete lesson plans from topic + region + grade
- **Structured Output**: Learning goals, activities, misconceptions, differentiation
- **Region-Tailored**: Examples and materials adapted to your location
- **Edit & Save**: Modify any section and save to your library
- **Firebase Auth**: Secure Google sign-in with cloud storage

## 🏗️ Project Structure

```
macathon2026/
├── apps/
│   └── web/                    # Next.js 15 frontend
│       ├── src/
│       │   ├── app/            # App Router pages
│       │   ├── components/     # React components
│       │   ├── lib/            # Firebase, API client
│       │   └── types/          # TypeScript types
│       └── .env.example
├── services/
│   └── api/                    # FastAPI backend
│       ├── app/
│       │   ├── models/         # Pydantic schemas
│       │   ├── routes/         # API endpoints
│       │   ├── services/       # Auth, Generator
│       │   └── repositories/   # Firestore CRUD
│       └── .env.example
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- Firebase Project (with Auth + Firestore enabled)
- Google Gemini API Key (optional - uses fallback without it)

### 1️⃣ Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Enable **Authentication** → Sign-in Methods → **Google**
4. Enable **Firestore Database** in production mode
5. Add security rules for Firestore:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /lessons/{lessonId} {
         allow read, write: if request.auth != null && request.auth.uid == resource.data.ownerUid;
         allow create: if request.auth != null;
       }
     }
   }
   ```
6. Go to Project Settings → Service Accounts → Generate new private key
7. Go to Project Settings → General → Your apps → Add Web App → Copy config

### 2️⃣ Backend Setup

```bash
cd services/api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your Firebase service account credentials and Gemini key

# Run the server
uvicorn app.main:app --reload --port 8000
```

Backend will be available at `http://localhost:8000`

### 3️⃣ Frontend Setup

```bash
cd apps/web

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env.local
# Edit .env.local with your Firebase web config

# Run the development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

## 📝 Environment Variables

### Backend (`services/api/.env`)

```env
# Firebase Service Account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id

# LLM API (optional - uses fallback without it)
GEMINI_KEY=sk-...

# CORS
CORS_ORIGINS=http://localhost:3000
```

### Frontend (`apps/web/.env.local`)

```env
# Firebase Web Config
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Backend URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🧪 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate` | Generate a new lesson plan |
| GET | `/api/lessons` | List all lessons for user |
| GET | `/api/lessons/{id}` | Get lesson by ID |
| PUT | `/api/lessons/{id}` | Update lesson |
| DELETE | `/api/lessons/{id}` | Delete lesson |

All endpoints require `Authorization: Bearer <firebase-id-token>` header.

## 📋 Lesson Plan Schema

Generated lesson plans include:
- **Learning Goals** - 3+ objectives
- **Prior Knowledge Recap** - Review bullets + quick checks
- **Core Explanation** - 5 paragraphs of content
- **Common Misconceptions** - 2+ with corrections
- **Hands-on Activity** - Low-resource materials, steps, prompts
- **Exit Ticket** - 4 assessment questions
- **Differentiation** - Strategies for all learner types
- **Local Context Examples** - Region-specific examples

## 🗺️ Phase Roadmap

- ✅ **Phase 1**: Form + generate structured lesson plan + save/edit in Firebase
- ⬜ **Phase 2**: Image understanding (diagram → key concepts)
- ⬜ **Phase 3**: Export PDF lesson plan + PDF slides
- ⬜ **Phase 4**: Storyboard + ElevenLabs narration + MP4 stitching
- ⬜ **Phase 5**: Local examples dataset + translation + offline mode

## 🤝 Contributing

This is a hackathon project! Feel free to extend for future phases.

## 📄 License

MIT
