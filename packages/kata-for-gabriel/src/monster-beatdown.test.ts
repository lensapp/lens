import { createGame, Dependencies } from "./monster-beatdown";
import asyncFn, { AsyncFnMock } from "@async-fn/jest";

describe("monster-beatdown", () => {
  let game: { start: () => void };
  let messageToPlayerMock: jest.Mocked<Dependencies["messageToPlayer"]>;
  let questionToPlayerMock: AsyncFnMock<Dependencies["questionToPlayer"]>;

  beforeEach(() => {
    messageToPlayerMock = jest.fn();
    questionToPlayerMock = asyncFn();

    game = createGame({
      messageToPlayer: messageToPlayerMock,
      questionToPlayer: questionToPlayerMock,
    });
  });

  describe("when game is not started", () => {
    it("does not message player about anything", () => {
      expect(messageToPlayerMock).not.toHaveBeenCalled();
    });

    it("does not question player about anything", () => {
      expect(questionToPlayerMock).not.toHaveBeenCalled();
    });
  });

  describe("when game is started", () => {
    beforeEach(() => {
      game.start();
    });

    it("player encounters a monster", () => {
      expect(messageToPlayerMock).toHaveBeenCalledWith("You encounter a monster");
    });

    it("player is asked if they wants to attack the monster", () => {
      expect(questionToPlayerMock).toHaveBeenCalledWith("Attack the monster?");
    });

    describe("when the player chooses to not attack the monster", () => {
      beforeEach(async () => {
        await questionToPlayerMock.resolve(false);
      });

      it("the player gets eaten", () => {
        expect(messageToPlayerMock).toHaveBeenCalledWith(
          "You chose not to attack the monster, and the monster eats you dead, in disappointment.",
        );
      });

      it("the player does not attack", () => {
        expect(messageToPlayerMock).not.toHaveBeenCalledWith("You attack the monster.");
      });
    });

    describe("when the player chooses to attack the monster", () => {
      beforeEach(async () => {
        await questionToPlayerMock.resolve(true);
      });

      it("the player attacks the monster", () => {
        expect(messageToPlayerMock).toHaveBeenCalledWith("You attack the monster.");
      });

      it("the player does not get eaten yet", () => {
        expect(messageToPlayerMock).not.toHaveBeenCalledWith(
          "You chose not to attack the monster, and the monster eats you dead, in disappointment.",
        );
      });
    });
  });
});
