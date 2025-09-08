import { emitHintGeneratedEvent, emitWordSetEvent } from "../events/emitEvents.js";

class Words {
  constructor(roomId, words) {
    this.roomId = roomId;
    this.preGenWords = words;
    this.currentIndex = 0;
    this.choosedWord = "";
    this.maskedWord = "";
  }

  getWordChoices() {
    this.currentIndex += 3;
    this.wordChoices = this.preGenWords.slice(this.currentIndex - 3, this.currentIndex);
    return this.wordChoices;
  }

  getCurrentWord() {
    return this.choosedWord;
  }

  getMaskedWord() {
    return this.maskedWord;
  }

  setChoosedWord(word) {
    if (!this.wordChoices?.includes(word)) return null;
    this.choosedWord = word;
    this.maskedWord = word.split("").map(() => "_").join("");
    emitWordSetEvent(this.roomId, { word: this.maskedWord });
    return this.maskedWord;
  }

  isCorrectGuess(word) {
    const guess = (word || "").trim().toLowerCase();
    return this.choosedWord === guess;
  }

  _generateHint() {
    let randomIndex = Math.floor(Math.random() * this.choosedWord.length);
    while (this.maskedWord[randomIndex] !== "_") {
      randomIndex = (randomIndex + 1) % this.choosedWord.length;
    }
    this.maskedWord = this.maskedWord.substring(0, randomIndex) + this.choosedWord[randomIndex] + this.maskedWord.substring(randomIndex + 1);
    emitHintGeneratedEvent(this.roomId, { hint: this.maskedWord });
    return this.maskedWord;
  }

  registerHintCheckpoints(timer) {
    if (!timer) return;
    console.log(this.choosedWord,"registering hint checkpoints");
    const length = this.choosedWord.length + 2;
    const hintsCount = Math.floor(length / 3);

    const totalTime = timer.duration;
    const interval = Math.floor(totalTime / (hintsCount + 1));

    for (let i = 0; i < hintsCount; i++) {
      const checkpointTime = totalTime - (interval * (i + 1));
      timer.addCheckpoint(checkpointTime, () => this._generateHint());
    }
  }
}

export default Words;