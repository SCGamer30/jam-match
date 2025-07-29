# JamMatch - AI-Powered Musician Band Matching

JamMatch is a full-stack application that uses AI-powered compatibility analysis to connect musicians and form bands. The system combines location proximity, musical preferences, and experience levels to create meaningful musical connections.

## Project Structure

```
jam-match/
├── frontend/          # Next.js 14 frontend with TypeScript and shadcn/ui
├── backend/           # Node.js/Express backend with TypeScript
├── ai-service/        # Python Flask AI service for compatibility analysis
├── .env.example       # Root environment variables template
└── README.md          # This file
```

## Technology Stack

### Frontend

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **shadcn/ui** component library
- **Tailwind CSS** for styling
- **Supabase** client for real-time features

### Backend

- **Node.js** with Express.js
- **TypeScript**
- **Supabase** JavaScript client
- **JWT** token validation
- **RESTful API** design

### AI Service

- **Python Flask** framework
- **Hugging Face Transformers** library
- **mistralai/Voxtral-Mini-3B-2507** model (to be integrated)
- **Docker** containerization
- **Railway** deployment ready

### Database & Auth

- **Supabase** (PostgreSQL)
- **Supabase Auth**
- **Real-time subscriptions**
- **Row Level Security** (RLS)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Docker (for AI service)
- Supabase account

### Environment Setup

1. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials and other configuration values in `.env`

3. Copy service-specific environment files:
   ```bash
   cp frontend/.env.local.example frontend/.env.local
   cp backend/.env.example backend/.env
   cp ai-service/.env.example ai-service/.env
   ```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend API will be available at `http://localhost:3001`

### AI Service Setup

```bash
cd ai-service
pip install -r requirements.txt
python app.py
```

The AI service will be available at `http://localhost:5000`

Alternatively, use Docker:

```bash
cd ai-service
docker build -t jamMatch-ai .
docker run -p 5000:5000 jamMatch-ai
```

## API Endpoints

### Backend API

- `GET /health` - Health check
- `GET /` - API info

### AI Service

- `GET /health` - Health check
- `POST /compatibility` - Calculate compatibility between two users

## Development

This project follows a microservices architecture with three main services:

1. **Frontend**: Handles user interface and client-side logic
2. **Backend**: Manages API endpoints, authentication, and business logic
3. **AI Service**: Provides AI-powered compatibility analysis

Each service can be developed and deployed independently.

## Next Steps

1. Set up Supabase database schema
2. Implement authentication system
3. Build user profile management
4. Develop matching algorithm
5. Create real-time chat system
6. Integrate AI compatibility analysis

## License

This project is licensed under the ISC License.
