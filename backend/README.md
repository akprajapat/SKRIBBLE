# Skribble Game Backend

A real-time drawing and guessing game backend built with Node.js and Socket.IO.

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
4. Start the server:
```bash
npm start
```

## Environment Variables

- `PERPLEXITY_API_KEY`: API key for word generation
- `PORT`: Server port (default: 4000)
- `CORS_ORIGINS`: Allowed CORS origins

## Project Structure

```
src/
├── app.js          # Express app setup
├── server.js       # HTTP server and Socket.IO initialization
├── socket.js       # Socket.IO event handlers
├── constants/      # Game constants and configurations
├── events/         # Event emitters and bus
├── handlers/       # Event handling logic
├── models/         # Game data models
├── services/       # Game services and room management
├── tests/         # Unit tests
└── utils/         # Utility functions
```

## Features

- Real-time multiplayer drawing and guessing
- Public and private rooms
- AI-powered word generation
- Score tracking
- Chat system
- Timer system

## API Documentation

### Socket Events

**Emit Events:**
- `join_room`: Join a game room
- `leave_room`: Leave current room
- `start_game`: Start a new game
- `draw`: Send drawing data
- `guess`: Submit a word guess
- `chat`: Send chat message

**Listen Events:**
- `room_joined`: Room join confirmation
- `game_started`: Game start notification
- `drawing_data`: Receive drawing data
- `correct_guess`: Correct guess notification
- `game_over`: Game end details
- `chat_message`: New chat message

## Testing

Run tests with:
```bash
npm test
```

## License

MIT License - see LICENSE file for details