import "./hotbar-menu.scss";

import React from "react";
import { observer } from "mobx-react";
import { HotbarIcon } from "./hotbar-icon";
import { cssNames, IClassName } from "../../utils";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { KubernetesCluster } from "../../../common/catalog-entities/kubernetes-cluster";
import { navigate } from "../../navigation";

interface Props {
  className?: IClassName;
}

@observer
export class HotbarMenu extends React.Component<Props> {
  render() {
    const { className } = this.props;
    const items = catalogEntityRegistry.getItemsForApiKind<KubernetesCluster>("entity.k8slens.dev/v1alpha1", "KubernetesCluster");
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
                onContextMenu={() => entity.onContextMenuOpen()}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

