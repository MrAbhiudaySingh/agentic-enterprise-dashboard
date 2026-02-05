# Agentic Enterprise Web Platform

A full-stack AI-powered enterprise operating system with a FastAPI backend and React frontend.

## Features

- **CEO Command Interface** - Natural language strategic directive processing
- **Multi-Agent Orchestration** - 6 AI agents (Sales, Marketing, Finance, Operations, Support, HR)
- **Gemini AI Integration** - Intelligent prompt parsing and dynamic calculations
- **Conflict Resolution** - Automatic cross-functional conflict detection
- **Real-time Dashboard** - Glassmorphism UI with live metrics and projections
- **Data Upload** - Company profile analysis via web scraping

## Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.12)
- **AI**: Google Gemini API
- **Data**: Pydantic models, web scraping
- **Server**: Uvicorn

### Frontend
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS + Glassmorphism
- **Charts**: Recharts
- **Icons**: Lucide React

## Project Structure

```
web/
├── backend/
│   ├── main.py              # FastAPI app with Gemini integration
│   ├── data_upload.py       # Company data scraping
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment template
│
└── frontend/
    ├── src/
    │   ├── components/dashboard/   # UI components
    │   ├── services/api.ts         # Backend API client
    │   └── App.tsx                 # Main app
    ├── package.json
    └── README.md
```

## Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/MrAbhiudaySingh/agentic-enterprise-dashboard.git
cd agentic-enterprise-dashboard
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your Gemini API key
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Run Both Services

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
GEMINI_API_KEY=your_google_gemini_api_key
SCRAPE_DO_API_KEY=your_scrape_do_key  # Optional
```

Get a Gemini API key at: https://makersuite.google.com/app/apikey

## API Endpoints

- `POST /api/calculate` - Parse CEO prompt and calculate metrics
- `POST /api/upload` - Upload company profile for analysis
- `GET /health` - Health check

## Production Build

```bash
# Build frontend
cd frontend
npm run build

# Serve backend (production)
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Related Projects

- [Agentic Enterprise CLI](https://github.com/MrAbhiudaySingh/agentic-enterprise) - Terminal version

## License

MIT
