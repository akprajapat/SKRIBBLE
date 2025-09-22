# Skribble Game Frontend

A React-based frontend for the multiplayer drawing and guessing game.

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```
4. Start the development server:
```bash
npm run dev
```

## Environment Variables

- `VITE_API_URL`: Backend API URL

## Project Structure

```
src/
├── App.jsx        # Main application component
├── components/    # Reusable UI components
├── context/      # React context providers
├── events/       # Event handlers
├── features/     # Major feature components
├── pages/        # Route pages
├── services/     # API services
└── utils/        # Utility functions
```

## Features

- Real-time canvas drawing
- Chat system
- Player scoreboard
- Word selection interface
- Timer display
- Responsive design

## Components

### Main Features
- `Canvas`: Drawing board with real-time updates
- `WordChoice`: Word selection interface
- `Scoreboard`: Player scores display
- `Result`: Game result display

### UI Components
- `Chat`: Real-time chat interface
- `Playerlist`: Active players display
- `Timer`: Game countdown timer
- `Topbar`: Navigation and game info
- `Dropdown`: Reusable dropdown menu
- `Input`: Custom input component

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

## License

MIT License - see LICENSE file for details