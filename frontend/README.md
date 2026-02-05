# Agentic Enterprise Dashboard

A modern React + TypeScript dashboard for the Agentic Enterprise Operating Model. Features real-time AI agent orchestration, conflict resolution, and strategic decision intelligence.

![Dashboard Preview](https://img.shields.io/badge/React-18-blue?style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square) ![Tailwind](https://img.shields.io/badge/Tailwind-3.0-cyan?style=flat-square)

## Features

- **CEO Command Interface** - Natural language prompt input for strategic directives
- **Multi-Agent Grid** - 6 AI agents (Sales, Marketing, Finance, Operations, Support, HR)
- **Real-time KPIs** - Profit growth, CTC reduction, confidence scores
- **Conflict Resolution** - Automatic detection and resolution of cross-functional conflicts
- **Interactive Charts** - Revenue and cost projections with Recharts
- **Glassmorphism UI** - Modern dark theme with neon accents and frosted glass panels

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, custom glassmorphism effects
- **Charts**: Recharts
- **Icons**: Lucide React
- **State**: React Query (TanStack Query)

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running (see Agentic Enterprise main project)

### Installation

```bash
# Clone the repository
git clone https://github.com/MrAbhiudaySingh/agentic-enterprise-dashboard.git
cd agentic-enterprise-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

## Environment Variables

Create a `.env` file in the root:

```env
VITE_API_URL=http://localhost:8000  # Backend API URL
```

## Project Structure

```
src/
├── components/
│   └── dashboard/
│       ├── AgentCard.tsx         # Individual agent display
│       ├── AgentGrid.tsx         # 6-agent grid layout
│       ├── CommandBar.tsx        # CEO prompt input
│       ├── ConflictResolution.tsx # Conflict panel
│       ├── GovernancePanel.tsx   # Confidence & compliance
│       ├── KPIStrip.tsx          # Top metrics row
│       └── OutcomeCharts.tsx     # Projection charts
├── services/
│   └── api.ts                    # API client
├── types/
│   └── index.ts                  # TypeScript types
├── App.tsx                       # Main app component
└── main.tsx                      # Entry point
```

## API Integration

The dashboard connects to a FastAPI backend that:
- Parses CEO prompts using Google Gemini AI
- Generates agent decisions dynamically
- Calculates projections and conflicts
- Returns structured metrics

## UI Design

- **Dark Theme**: Navy background (`hsl(222 47% 6%)`)
- **Neon Accents**: Cyan, green, orange, purple highlights
- **Glassmorphism**: Frosted panels with `backdrop-filter: blur(20px)`
- **Typography**: Inter (body), JetBrains Mono (numbers)
- **Animations**: Fade-in effects, hover glows, gradient borders

## Related Projects

- [Agentic Enterprise Core](https://github.com/MrAbhiudaySingh/agentic-enterprise) - Python backend and orchestration

## License

MIT

---

Built for hackathons and enterprise AI demonstrations.
