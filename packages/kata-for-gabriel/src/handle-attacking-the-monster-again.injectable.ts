import { getInjectable } from "@ogre-tools/injectable";
import questionToPlayerInjectable from "./question-to-player.injectable";
import messageToPlayerInjectable from "./message-to-player.injectable";

const handleAttackingTheMonsterAgainInjectable = getInjectable({
  id: "handle-attacking-the-monster-again",

  instantiate: (di) => {
    const questionToPlayer = di.inject(questionToPlayerInjectable);
    const messageToPlayer = di.inject(messageToPlayerInjectable);

    return async () => {
      const playerWantsToAttackAgain = await questionToPlayer("Do you want to attack again?");

      if (playerWantsToAttackAgain) {
        return { gameIsOver: false };
      }

      messageToPlayer(
        "You lose your nerve mid-beat-down, and try to run away. You get eaten by a sad, disappointed monster.",
      );

      messageToPlayer("You lose. Game over!");

      return { gameIsOver: true };
    };
  },
});

export default handleAttackingTheMonsterAgainInjectable;
