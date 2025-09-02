import Player from '../../models/player.js';

describe('Player Model', () => {
  let player;

  beforeEach(() => {
    player = new Player({ id: '1', name: 'TestPlayer' });
  });

  test('should initialize with correct values', () => {
    expect(player.id).toBe('1');
    expect(player.name).toBe('TestPlayer');
    expect(player.score).toBe(0);
    expect(player.connected).toBe(true);
  });

  test('should update connection status', () => {
    player.setConnected(false);
    expect(player.connected).toBe(false);
  });

  test('should update score', () => {
    player.addScore(100);
    expect(player.score).toBe(100);
  });

  test('should reset score', () => {
    player.addScore(100);
    player.resetScore();
    expect(player.score).toBe(0);
  });
});
