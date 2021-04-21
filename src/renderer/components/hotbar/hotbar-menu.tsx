import "./hotbar-menu.scss";

import React from "react";
import { observer } from "mobx-react";
import { HotbarIcon } from "./hotbar-icon";
import { cssNames, IClassName } from "../../utils";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { HotbarStore } from "../../../common/hotbar-store";
import { catalogEntityRunContext } from "../../api/catalog-entity";

interface Props {
  className?: IClassName;
}

@observer
export class HotbarMenu extends React.Component<Props> {

  get hotbarItems() {
    const hotbar = HotbarStore.getInstance().getByName("default"); // FIXME

    if (!hotbar) {
      return [];
    }

    return hotbar.items.map((item) => catalogEntityRegistry.items.find((entity) => entity.metadata.uid === item.entity.uid)).filter(Boolean);
  }

  render() {
    const { className } = this.props;

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
      </div>
    );
  }
}
