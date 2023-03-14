import { handleLandedHitOnMonsterFor, Monster } from "./handle-landed-hit-on-monster-for";

export type Dependencies = {
  messageToPlayer: (message: string) => void;
  questionToPlayer: (message: string) => Promise<boolean>;
  castDie: () => Promise<number>;
};

const createGame = ({ messageToPlayer, questionToPlayer, castDie }: Dependencies) => {
  const monster: Monster = { hitPoints: 3 };

  const handleLandedHitOnMonster = handleLandedHitOnMonsterFor({ messageToPlayer, monster });

  return {
    start: async () => {
      messageToPlayer(`You encounter a monster with ${monster.hitPoints} hit-points`);

      const playerWantsToAttack = await questionToPlayer("Attack the monster?");
      if (!playerWantsToAttack) {
        messageToPlayer(
          "You chose not to attack the monster, and the monster eats you dead, in disappointment.",
        );

        messageToPlayer("You lose. Game over!");

        return;
      }

      while (true) {
        messageToPlayer("You attack the monster.");

        const dieResult = await castDie();

        const playerLandsHitOnMonster = dieResult > 3;
        if (playerLandsHitOnMonster) {
          const { monsterIsDead } = handleLandedHitOnMonster();
          if (monsterIsDead) {
            return;
          }
        } else {
          messageToPlayer(
            `You fail to land a hit on the monster, and it still has ${monster.hitPoints} hit-points remaining.`,
          );
        }

        const playerWantsToAttackAgain = await questionToPlayer("Do you want to attack again?");

        if (!playerWantsToAttackAgain) {
          messageToPlayer(
            "You lose your nerve mid-beat-down, and try to run away. You get eaten by a sad, disappointed monster.",
          );

          messageToPlayer("You lose. Game over!");

          return;
        }
      }
    },
  };
};

export { createGame };

