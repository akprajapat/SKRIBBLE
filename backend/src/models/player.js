import eventBus from "../events/eventBus.js";

class Player {
  constructor({ id, name, socket, score = 0, rank = 1 }) {
    console.log(`Creating player: id=${id}, name=${name}, socket=${socket}`);
    this.id = id;
    this.name = name;
    this.socket = socket;
    this.score = score;
    this.rank = rank;
  }
  
  sendEvent(event, data) {
    eventBus.emit(event, this.socket, data);
  }

  updateScore(score) {
    this.score += score || 0;
    console.log(`Updated player ${this.name} score to ${this.score}`);
    return this.score;
  }

  updateRank(newRank) {
    this.rank = newRank;
    console.log(`Updated player ${this.name} rank to ${this.rank}`);
  }
}

export default Player;
