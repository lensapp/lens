import { handleLandedHitOnMonsterFor, Monster } from "./handle-landed-hit-on-monster-for";
import { handleInitialMonsterEncounterFor } from "./handle-initial-monster-encounter-for";
import { handleAttackOnMonsterFor } from "./handle-attack-on-monster-for";
import { handleAttackingTheMonsterAgainFor } from "./handle-attacking-the-monster-again-for";

export type Dependencies = {
  messageToPlayer: (message: string) => void;
  questionToPlayer: (message: string) => Promise<boolean>;
  castDie: () => Promise<number>;
};

const createGame = ({ messageToPlayer, questionToPlayer, castDie }: Dependencies) => {
  const monster: Monster = { hitPoints: 3 };

  const handleLandedHitOnMonster = handleLandedHitOnMonsterFor({ messageToPlayer, monster });

  const handleAttackOnMonster = handleAttackOnMonsterFor({
    monster,
    messageToPlayer,
    handleLandedHitOnMonster,
    castDie,
  });

  const handleAttackingTheMonsterAgain = handleAttackingTheMonsterAgainFor({
    messageToPlayer,
    questionToPlayer,
  });

  const handleInitialMonsterEncounter = handleInitialMonsterEncounterFor({
    messageToPlayer,
    questionToPlayer,
    monster,
  });

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
};

export { createGame };
