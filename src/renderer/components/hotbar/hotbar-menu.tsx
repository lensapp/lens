import "./hotbar-menu.scss";
import "./hotbar.commands";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { HotbarIcon } from "./hotbar-icon";
import { cssNames, IClassName } from "../../utils";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { hotbarStore } from "../../../common/hotbar-store";
import { catalogEntityRunContext } from "../../api/catalog-entity";
import { reaction } from "mobx";
import { Notifications } from "../notifications";
import { Icon } from "../icon";
import { Badge } from "../badge";
import { CommandOverlay } from "../command-palette";
import { HotbarSwitchCommand } from "./hotbar-switch-command";

interface Props {
  className?: IClassName;
}

@observer
export class HotbarMenu extends React.Component<Props> {

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => hotbarStore.activeHotbarId, () => {
        Notifications.info(`Hotbar "${hotbarStore.getActive().name}" is now active.`, {
          id: "active-hotbar",
          timeout: 5_000
        });
      })
    ]);
  }

  get hotbarItems() {
    const hotbar = hotbarStore.getActive();

    if (!hotbar) {
      return [];
    }

    return hotbar.items.map((item) => catalogEntityRegistry.items.find((entity) => entity.metadata.uid === item.entity.uid)).filter(Boolean);
  }

  previous() {
    let index = hotbarStore.activeHotbarIndex - 1;

    if (index < 0) {
      index = hotbarStore.hotbars.length - 1;
    }

    hotbarStore.activeHotbarId = hotbarStore.hotbars[index].id;
  }

  next() {
    let index = hotbarStore.activeHotbarIndex + 1;

    if (index >= hotbarStore.hotbars.length) {
      index = 0;
    }

    hotbarStore.activeHotbarId = hotbarStore.hotbars[index].id;
  }

  openSelector() {
    CommandOverlay.open(<HotbarSwitchCommand />);
  }

  render() {
    const { className } = this.props;
    const hotbarIndex = hotbarStore.activeHotbarIndex + 1;

    return (
      <div className={cssNames("HotbarMenu flex column", className)}>
        <div className="items flex column gaps">
          {this.hotbarItems.map((entity, index) => {
            return (
              <HotbarIcon
                key={index}
                index={index}
                entity={entity}
                isActive={entity.status.active}
                onClick={() => entity.onRun(catalogEntityRunContext)}
              />
            );
          })}
        </div>
        <div className="HotbarSelector flex gaps auto">
          <Icon material="chevron_left" className="previous box" onClick={() => this.previous()} />
          <div className="box">
            <Badge small label={hotbarIndex} onClick={() => this.openSelector()} />
          </div>
          <Icon material="chevron_right" className="next box" onClick={() => this.next()} />
        </div>
      </div>
    );
  }
}

