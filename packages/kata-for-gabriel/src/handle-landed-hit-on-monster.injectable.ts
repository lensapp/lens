import { getInjectable } from "@ogre-tools/injectable";
import monsterInjectable from "./monster.injectable";
import messageToPlayerInjectable from "./message-to-player.injectable";

const handleLandedHitOnMonsterInjectable = getInjectable({
  id: "handle-landed-hit-on-monster",

  instantiate: (di) => {
    const monster = di.inject(monsterInjectable);
    const messageToPlayer = di.inject(messageToPlayerInjectable);

    return () => {
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
  },
});

export default handleLandedHitOnMonsterInjectable;
