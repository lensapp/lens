import type { Monster } from "./handle-landed-hit-on-monster-for";
import type { Dependencies } from "./monster-beatdown";

export const handleInitialMonsterEncounterFor =
  ({
     monster,
     messageToPlayer,
     questionToPlayer,
   }: {
    monster: Monster;
    messageToPlayer: Dependencies["messageToPlayer"];
    questionToPlayer: Dependencies["questionToPlayer"];
  }) =>
    async () => {
      messageToPlayer(`You encounter a monster with ${monster.hitPoints} hit-points`);

      const playerWantsToAttack = await questionToPlayer("Attack the monster?");
      if (playerWantsToAttack) {
        return { gameIsOver: false };
      }

      messageToPlayer(
        "You chose not to attack the monster, and the monster eats you dead, in disappointment.",
      );

      messageToPlayer("You lose. Game over!");

      return { gameIsOver: true };
    };
