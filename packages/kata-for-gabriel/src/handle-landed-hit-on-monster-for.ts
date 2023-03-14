import type { Dependencies } from "./monster-beatdown";

export type Monster = {
  hitPoints: number;
};

export const handleLandedHitOnMonsterFor =
  ({
     monster,
     messageToPlayer,
   }: {
    monster: Monster;
    messageToPlayer: Dependencies["messageToPlayer"];
  }) =>
    () => {
      monster.hitPoints--;

      if (monster.hitPoints) {
        messageToPlayer(
          `You successfully land a hit on the monster, and it now only has ${monster.hitPoints} hit-points remaining.`,
        );

        return { monsterIsDead: false };
      }

      messageToPlayer(
        "You successfully land a final hit on the monster, and it is now properly beat.",
      );

      messageToPlayer("You win. Congratulations!");

      return { monsterIsDead: true };
    };
