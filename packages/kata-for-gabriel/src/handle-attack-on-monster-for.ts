import type { Monster } from "./handle-landed-hit-on-monster-for";
import type { Dependencies } from "./monster-beatdown";

export const handleAttackOnMonsterFor =
  ({
     monster,
     messageToPlayer,
     handleLandedHitOnMonster,
     castDie,
   }: {
    monster: Monster;
    messageToPlayer: Dependencies["messageToPlayer"];
    handleLandedHitOnMonster: () => { monsterIsDead: boolean };
    castDie: () => Promise<number>;
  }) =>
    async () => {
      messageToPlayer("You attack the monster.");

      const dieResult = await castDie();

      const playerLandsHitOnMonster = dieResult > 3;
      if (playerLandsHitOnMonster) {
        const { monsterIsDead } = handleLandedHitOnMonster();
        if (monsterIsDead) {
          return { gameIsOver: true };
        }
      } else {
        messageToPlayer(
          `You fail to land a hit on the monster, and it still has ${monster.hitPoints} hit-points remaining.`,
        );
      }

      return { gameIsOver: false };
    };
