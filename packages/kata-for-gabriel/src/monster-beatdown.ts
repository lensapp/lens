export type Dependencies = {
  messageToPlayer: (message: string) => void;
  questionToPlayer: (message: string) => Promise<boolean>;
};

const createGame = ({ messageToPlayer, questionToPlayer }: Dependencies) => ({
  start: async () => {
    messageToPlayer("You encounter a monster");

    const playerWantsToAttack = await questionToPlayer("Attack the monster?");
    if (playerWantsToAttack) {
      messageToPlayer("You attack the monster.");
    } else {
      messageToPlayer(
        "You chose not to attack the monster, and the monster eats you dead, in disappointment.",
      );
    }
  },
});

export { createGame };
