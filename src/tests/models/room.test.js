import Room from '../../models/room.js';
import eventBus from '../../events/eventBus.js';

jest.mock('../../events/eventBus.js');

describe('Room Model', () => {
  let room;
  
  beforeEach(() => {
    room = new Room('test-room');
    eventBus.emit.mockClear();
  });

  test('should initialize with correct values', () => {
    expect(room.id).toBe('test-room');
    expect(room.players).toEqual([]);
    expect(room.game).toBeNull();
  });

  test('should add player to room', () => {
    const player = { id: '1', name: 'Player1' };
    room.addPlayer(player);
    expect(room.players).toContainEqual(player);
    expect(eventBus.emit).toHaveBeenCalledWith('PLAYER_JOINED', {
      roomId: 'test-room',
      player
    });
  });

  test('should remove player from room', () => {
    const player = { id: '1', name: 'Player1' };
    room.addPlayer(player);
    room.removePlayer('1');
    expect(room.players).not.toContainEqual(player);
    expect(eventBus.emit).toHaveBeenCalledWith('PLAYER_LEFT', {
      roomId: 'test-room',
      playerId: '1'
    });
  });

  test('should start game', () => {
    room.addPlayer({ id: '1', name: 'Player1' });
    room.addPlayer({ id: '2', name: 'Player2' });
    room.startGame();
    expect(room.game).not.toBeNull();
  });
});
