import { 
  emitTimerTickEvent, 
  emitTimerEndEvent,
  emitTimerCheckpointEvent 
} from "../events/emitEvents.js";

export default class Timer {
  constructor({ roomId, durationSec, type }) {
    this.roomId = roomId;
    this.duration = durationSec;
    this.timeLeft = durationSec;
    this._interval = null;
    this.checkpoints = new Map(); // { second -> [callbacks] }
    this.type = type;
  }

  start(duration = this.duration) {
    this.stop(false); // stop without emitting TIMER_END here
    this.duration = duration;
    this.timeLeft = duration;

    emitTimerTickEvent(this.roomId, { type: this.type, timeLeft: this.timeLeft });

    this._interval = setInterval(() => {
      this.timeLeft -= 1;

      // Trigger checkpoint callbacks if matched
      if (this.checkpoints.has(this.timeLeft)) {
        console.log(`Triggering ${this.checkpoints.get(this.timeLeft).length} checkpoint(s) at ${this.timeLeft}s for room ${this.roomId}`);
        emitTimerCheckpointEvent(this.roomId, { timeLeft: this.timeLeft });
        this.checkpoints.get(this.timeLeft).forEach(cb => cb());
      }

      if (this.timeLeft > 0) {
        emitTimerTickEvent(this.roomId, { type: this.type, timeLeft: this.timeLeft });
      } else {
        this.stop(true); // will now emit TIMER_END
      }
    }, 1000);
  }

  stop(emitEnd = true) {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
    if (emitEnd) {
      emitTimerEndEvent(this.roomId, {type: this.type});
    }
  }

  addCheckpoint(time, cb) {
    this.checkpoints.set(time, (this.checkpoints.get(time) || []).concat(cb));
    console.log(`Checkpoint added at ${time}s for room ${this.roomId}`);
    console.log(this.checkpoints);
  }

}
