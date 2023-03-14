import { getInjectable } from "@ogre-tools/injectable";
import handleInitialMonsterEncounterInjectable from "./handle-initial-monster-encounter-for";
import handleAttackOnMonsterInjectable from "./handle-attack-on-monster-for";
import handleAttackingTheMonsterAgainInjectable from "./handle-attacking-the-monster-again-for";

export type Dependencies = {
  messageToPlayer: (message: string) => void;
  questionToPlayer: (message: string) => Promise<boolean>;
  castDie: () => Promise<number>;
};

export const gameInjectable = getInjectable({
  id: "game",

  instantiate: (di) => {
    const handleInitialMonsterEncounter = di.inject(handleInitialMonsterEncounterInjectable);
    const handleAttackOnMonster = di.inject(handleAttackOnMonsterInjectable);
    const handleAttackingTheMonsterAgain = di.inject(handleAttackingTheMonsterAgainInjectable);

    return {
      start: async () => {
        const initialEncounterResult = await handleInitialMonsterEncounter();
        if (initialEncounterResult.gameIsOver) {
          return;
        }

        while (true) {
          const attackResult = await handleAttackOnMonster();
          if (attackResult.gameIsOver) {
            return;
          }

          const attackAgainResult = await handleAttackingTheMonsterAgain();
          if (attackAgainResult.gameIsOver) {
            return;
          }
        }
      },
    };
  },
});
