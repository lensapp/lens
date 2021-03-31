import "./hotbar-menu.scss";

import React from "react";
import { observer } from "mobx-react";
import { HotbarIcon } from "./hotbar-icon";
import { cssNames, IClassName } from "../../utils";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { navigate } from "../../navigation";
import { hotbarStore } from "../../../common/hotbar-store";

interface Props {
  className?: IClassName;
}

@observer
export class HotbarMenu extends React.Component<Props> {
  render() {
    const { className } = this.props;
    const hotbar = hotbarStore.getByName("default"); // FIXME
    const items = hotbar.items.map((item) => catalogEntityRegistry.items.find((entity) => entity.metadata.uid === item.entity.uid)).filter(Boolean);
    const runContext = {
      navigate: (url: string) => navigate(url)
    };

    return (
      <div className={cssNames("HotbarMenu flex column", className)}>
        <div className="clusters flex column gaps">
          {items.map((entity) => {
            return (
              <HotbarIcon
                key={entity.metadata.uid}
                entity={entity}
                isActive={entity.status.active}
                onClick={() => entity.onRun(runContext)}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

