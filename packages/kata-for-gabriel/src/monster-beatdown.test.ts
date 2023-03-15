import { Dependencies, gameInjectable } from "./monster-beatdown.injectable";
import asyncFn, { AsyncFnMock } from "@async-fn/jest";
import { getPromiseStatus } from "@k8slens/test-utils";
import { createContainer, DiContainer, getInjectable } from "@ogre-tools/injectable";
import messageToPlayerInjectable from "./message-to-player.injectable";
import castDieInjectable from "./cast-die.injectable";
import questionToPlayerInjectable from "./question-to-player.injectable";
import { registerFeature } from "@k8slens/feature-core";
import { gabrielFeature } from "./feature";
import { monsterInjectionToken } from "./monster.injectable";
import { find } from "lodash/fp";
import getRandomSampleFromCollectionInjectable from "./get-random-sample-from-collection.injectable";

describe("monster-beatdown, given there are monsters in the monster pool", () => {
  let game: { start: () => Promise<void> };
  let messageToPlayerMock: jest.Mock<Dependencies["messageToPlayer"]>;
  let questionToPlayerMock: AsyncFnMock<Dependencies["questionToPlayer"]>;
  let castDieMock: AsyncFnMock<Dependencies["castDie"]>;
  let gamePromise: Promise<void>;
  let di: DiContainer;

  beforeEach(() => {
    di = createContainer("monster-beatdown");

    di.preventSideEffects();

    registerFeature(di, gabrielFeature);

    messageToPlayerMock = jest.fn();
    di.override(messageToPlayerInjectable, () => messageToPlayerMock);
    di.override(questionToPlayerInjectable, () => questionToPlayerMock);
    di.override(castDieInjectable, () => castDieMock);

    questionToPlayerMock = asyncFn();
    castDieMock = asyncFn();

    const someMonsterInjectable = getInjectable({
      id: "some-janne-monster",
      instantiate: () => ({ name: "Janne", hitPoints: 3 }),
      injectionToken: monsterInjectionToken,
    });

    di.register(someMonsterInjectable);
    di.override(getRandomSampleFromCollectionInjectable, () => find({ name: "Janne" }));

    game = di.inject(gameInjectable);
  });

  describe("when game is not started", () => {
    it("does not message player about anything", () => {
      expect(messageToPlayerMock).not.toHaveBeenCalled();
    });

    it("does not question player about anything", () => {
      expect(questionToPlayerMock).not.toHaveBeenCalled();
    });

    it("no dice are cast", () => {
      expect(castDieMock).not.toHaveBeenCalled();
    });
  });

  describe("when game is started", () => {
    beforeEach(() => {
      gamePromise = game.start();
    });

    it("player encounters one of the monsters", () => {
      expect(messageToPlayerMock.mock.calls).toEqual([
        ['You encounter a monster "Janne" with 3 hit-points'],
      ]);
    });

    it("player is asked if they wants to attack the monster", () => {
      expect(questionToPlayerMock.mock.calls).toEqual([["Attack the monster?"]]);
    });

    describe("when the player chooses to not attack the monster", () => {
      beforeEach(async () => {
        messageToPlayerMock.mockClear();

        await questionToPlayerMock.resolve(false);
      });

      it("the player gets eaten", () => {
        expect(messageToPlayerMock.mock.calls).toEqual([
          [
            "You chose not to attack the monster, and the monster eats you dead, in disappointment.",
          ],
          ["You lose. Game over!"],
        ]);
      });

      it("no dice are cast", () => {
        expect(castDieMock).not.toHaveBeenCalled();
      });

      it("the game ends", async () => {
        const promiseStatus = await getPromiseStatus(gamePromise);

        expect(promiseStatus.fulfilled).toBe(true);
      });
    });

    describe("when the player chooses to attack the monster", () => {
      beforeEach(async () => {
        messageToPlayerMock.mockClear();

        await questionToPlayerMock.resolve(true);
      });

      it("the player attacks the monster", () => {
        expect(messageToPlayerMock.mock.calls).toEqual([["You attack the monster."]]);
      });

      it("a die is cast", () => {
        expect(castDieMock).toHaveBeenCalled();
      });

      it("when the die lands on 4 or more, the monster loses a hit-point", async () => {
        messageToPlayerMock.mockClear();

        await castDieMock.resolve(4);

        expect(messageToPlayerMock.mock.calls).toEqual([
          [
            "You successfully land a hit on the monster, and it now only has 2 hit-points remaining.",
          ],
        ]);
      });

      it("when the die lands on 3 or less, the monster doesn't lose a hit-point", async () => {
        messageToPlayerMock.mockClear();

        await castDieMock.resolve(3);

        expect(messageToPlayerMock.mock.calls).toEqual([
          ["You fail to land a hit on the monster, and it still has 3 hit-points remaining."],
        ]);
      });

      it("after the die lands, the player is asked to attack again", async () => {
        questionToPlayerMock.mockClear();

        await castDieMock.resolve(0);

        expect(questionToPlayerMock.mock.calls).toEqual([["Do you want to attack again?"]]);
      });

      describe("when the player hits, and chooses to keep hitting until the monster is reduced to 0 hit-points", () => {
        beforeEach(async () => {
          await castDieMock.resolve(4);
          await questionToPlayerMock.resolve(true);
          await castDieMock.resolve(4);
          await questionToPlayerMock.resolve(true);

          messageToPlayerMock.mockClear();
          await castDieMock.resolve(4);
        });

        it("the player wins", () => {
          expect(messageToPlayerMock.mock.calls).toEqual([
            ["You successfully land a final hit on the monster, and it is now properly beat."],
            ["You win. Congratulations!"],
          ]);
        });

        it("the game ends", async () => {
          const promiseStatus = await getPromiseStatus(gamePromise);

          expect(promiseStatus.fulfilled).toBe(true);
        });
      });

      describe("given the player hits, and chooses to keep hitting until the monster is reduced to only 1 hit-points, when the player chooses to not hit the monster", () => {
        beforeEach(async () => {
          await castDieMock.resolve(4);
          await questionToPlayerMock.resolve(true);
          await castDieMock.resolve(4);

          messageToPlayerMock.mockClear();
          await questionToPlayerMock.resolve(false);
        });

        it("the player loses", async () => {
          expect(messageToPlayerMock.mock.calls).toEqual([
            [
              "You lose your nerve mid-beat-down, and try to run away. You get eaten by a sad, disappointed monster.",
            ],

            ["You lose. Game over!"],
          ]);
        });

        it("the game ends", async () => {
          const promiseStatus = await getPromiseStatus(gamePromise);

          expect(promiseStatus.fulfilled).toBe(true);
        });
      });
    });
  });
});
