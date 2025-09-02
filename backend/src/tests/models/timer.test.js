import { jest } from '@jest/globals';

await jest.unstable_mockModule('../../events/eventBus.js', () => ({
  default: { emit: jest.fn() } // <-- make emit a mock function
}));

const eventBus = (await import('../../events/eventBus.js')).default;
const TimerModule = await import('../../models/timer.js');
const Timer = TimerModule.default;

jest.useFakeTimers();

describe('Timer Model', () => {
  let timer;

  beforeEach(() => {
    timer = new Timer({ roomId: 'test-room', durationSec: 60 });
    eventBus.emit.mockClear();
  });

  afterEach(() => {
    jest.clearAllTimers();
    eventBus.emit.mockClear();
  });

  test('should initialize with correct values', () => {
    expect(timer.roomId).toBe('test-room');
    expect(timer.duration).toBe(60); // must match your Timer class property
    expect(timer.timeLeft).toBe(60);
  });

  test('should start timer and emit ticks', () => {
    timer.start();
    jest.advanceTimersByTime(1000); // 1 second
    jest.runOnlyPendingTimers(); // ensure interval runs
    expect(eventBus.emit).toHaveBeenCalledWith('TIMER_TICK', {
      roomId: 'test-room',
      timeLeft: 59
    });
  });
  
  test('should stop timer', () => {
    timer.start();

    jest.advanceTimersByTime(2000);
    const callsBeforeStop = eventBus.emit.mock.calls.length;

    timer.stop();
    jest.advanceTimersByTime(3000);

    expect(eventBus.emit).toHaveBeenCalledWith('TIMER_END', { roomId: 'test-room' });
    expect(eventBus.emit.mock.calls.length).toBe(callsBeforeStop + 1); // exactly one new event
  });

  test('should emit timer end event', () => {
    timer.start();
    jest.advanceTimersByTime(60000); // 60 seconds
    jest.runOnlyPendingTimers();
    expect(eventBus.emit).toHaveBeenCalledWith('TIMER_END', {
      roomId: 'test-room'
    });
  });

  test('should call checkpoint callback when timeLeft matches', () => {
    const checkpointCallback = jest.fn();
    timer.addCheckpoint(55, checkpointCallback);

    timer.start();
    jest.advanceTimersByTime(5000); // move 5 seconds (timeLeft = 55)

    expect(checkpointCallback).toHaveBeenCalledTimes(1);
    expect(eventBus.emit).toHaveBeenCalledWith('TIMER_CHECKPOINT', {
      roomId: 'test-room',
      checkpoint: 55
    });
  });

  test('should support multiple checkpoints', () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();
    timer.addCheckpoint(58, cb1);
    timer.addCheckpoint(55, cb2);

    timer.start();
    jest.advanceTimersByTime(2000); // 58 left
    expect(cb1).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(3000); // 55 left
    expect(cb2).toHaveBeenCalledTimes(1);
  });

});
