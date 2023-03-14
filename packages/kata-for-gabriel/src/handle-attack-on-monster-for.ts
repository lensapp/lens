import { getInjectable } from "@ogre-tools/injectable";
import messageToPlayerInjectable from "./message-to-player";
import castDieInjectable from "./cast-die";
import monsterInjectable from "./monster";
import handleLandedHitOnMonsterInjectable from "./handle-landed-hit-on-monster-for";

const handleAttackOnMonsterInjectable = getInjectable({
  id: "handle-attack-on-monster",

  instantiate: (di) => {
    const messageToPlayer = di.inject(messageToPlayerInjectable);
    const castDie = di.inject(castDieInjectable);
    const handleLandedHitOnMonster = di.inject(handleLandedHitOnMonsterInjectable);
    const monster = di.inject(monsterInjectable);

    return async () => {
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
  },
});

export default handleAttackOnMonsterInjectable;
