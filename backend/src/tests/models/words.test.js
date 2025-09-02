import Words from "../../models/words.js";

describe('Words Model', () => {
  const wordList = ['apple', 'banana', 'orange','kiwi'];
  const words = new Words(wordList);

  describe('initialization', () => {
    test('should initialize with word list', () => {
      expect(words.preGenWords).toEqual(wordList);
    });
  });

  describe('word management', () => {
    test('should get maskedword choices', () => {
      const choices = words.getWordChoices();
      expect(choices).toHaveLength(3);
      choices.forEach(word => {
        expect(wordList).toContain(word);
      });
    });

    test('should set word and return masked word', () => {
      const word = 'apple';
      const maskedWord = words.setChoosedWord(word);
      expect(words.choosedWord).toBe(word);
      expect(maskedWord).toBe('_____');
    });

    test('should set word only when it was in word choices', () => {
      const word = "asdsd";
      const maskedWord = words.setChoosedWord(word);
      expect(maskedWord).toBe(null);
    });

    test('should generate hint with first letter revealed', () => {
      words.setChoosedWord('apple');
      const hint = words.generateHint();
      expect(hint).toHaveLength(5);
      for (let i = 0; i < hint.length; i++) {
        if (hint[i] === "_") {
          expect(hint[i]).toBe("_");
        } else {
          expect(hint[i]).toBe(words.choosedWord[i]);
        }
      }
    });

    test('should validate correct guess case-insensitively', () => {
      words.setChoosedWord('apple');
      expect(words.isCorrectGuess('apple')).toBeTruthy();
      expect(words.isCorrectGuess('APPLe ')).toBeTruthy();
      expect(words.isCorrectGuess('banana')).toBeFalsy();
    });
  });
});
