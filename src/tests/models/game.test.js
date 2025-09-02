import Game from '../../models/game.js';
import eventBus from '../../events/eventBus.js';

jest.mock('../../events/eventBus.js');
jest.mock('../../utils/wordGeneratorAI.js', () => {
  return jest.fn().mockResolvedValue(['word1', 'word2', 'word3']);
});

describe('Game Model', () => {
  let game;
  
  beforeEach(() => {
    game = new Game({ roomId: 'test-room' });
    eventBus.emit.mockClear();
  });

  test('should initialize with default values', () => {
    expect(game.roomId).toBe('test-room');
    expect(game.totalRounds).toBe(3);
    expect(game.maxPlayers).toBe(8);
    expect(game.players).toEqual([]);
  });

  test('should start game with players', async () => {
    const players = [
      { id: '1', name: 'Player1', connected: true, score: 0 },
      { id: '2', name: 'Player2', connected: true, score: 0 }
    ];
    
    await game.start(players);
    
    expect(game.players).toEqual(players);
    expect(eventBus.emit).toHaveBeenCalledWith('GAME_STARTED', {
      roomId: 'test-room',
      players
    });
  });

  test('should handle player guess correctly', () => {
    game.players = [
      { id: '1', name: 'Player1', connected: true, score: 0 },
      { id: '2', name: 'Player2', connected: true, score: 0 }
    ];
    game.currentWord = 'test';
    game.timer = { timeLeft: 30 };
    
    game.handleGuess('1', 'test');
    
    expect(game.guessedIds.has('1')).toBeTruthy();
    expect(eventBus.emit).toHaveBeenCalledWith('CORRECT_GUESS', 
      expect.objectContaining({
        roomId: 'test-room',
        playerId: '1'
      })
    );
  });

  test('should handle player leaving', () => {
    game.players = [
      { id: '1', name: 'Player1', connected: true, score: 0 },
      { id: '2', name: 'Player2', connected: true, score: 0 }
    ];
    game.drawerIndex = 0;
    game.timer = { stop: jest.fn() };
    
    game.onPlayerLeft('1');
    
    expect(game.players[0].connected).toBeFalsy();
    expect(game.timer.stop).toHaveBeenCalled();
  });
});
