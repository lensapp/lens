export type Dependencies = {
  messageToPlayer: (message: string) => void;
  questionToPlayer: (message: string) => Promise<boolean>;
  castDie: () => Promise<number>;
};

const createGame = ({ messageToPlayer, questionToPlayer, castDie }: Dependencies) => ({
  start: async () => {
    let monsterHitPoints = 3;

    messageToPlayer(`You encounter a monster with ${monsterHitPoints} hit-points`);

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
        monsterHitPoints--;

        if (!monsterHitPoints) {
          messageToPlayer(
            "You successfully land a final hit on the monster, and it is now properly beat.",
          );

          messageToPlayer("You win. Congratulations!");

          return;
        }

        messageToPlayer(
          `You successfully land a hit on the monster, and it now only has ${monsterHitPoints} hit-points remaining.`,
        );
      } else {
        messageToPlayer(
          `You fail to land a hit on the monster, and it still has ${monsterHitPoints} hit-points remaining.`,
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
});

export { createGame };
