import type { Dependencies } from "./monster-beatdown";

export const handleAttackingTheMonsterAgainFor =
  ({
    messageToPlayer,
    questionToPlayer,
  }: {
    messageToPlayer: Dependencies["messageToPlayer"];
    questionToPlayer: Dependencies["questionToPlayer"];
  }) =>
  async () => {
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
