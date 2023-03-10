/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import type { KubernetesCluster } from "../../../common/catalog-entities";
import type { ClusterPreferences } from "../../../common/cluster-types";
import type { Cluster } from "../../../common/cluster/cluster";
import { Avatar } from "../avatar";
import { FilePicker, OverSizeLimitStyle } from "../file-picker";
import { MenuActions, MenuItem } from "../menu";
import type { ShowNotification } from "../notifications";
import showErrorNotificationInjectable from "../notifications/show-error-notification.injectable";
import { ClusterIconMenuItem, clusterIconSettingsMenuInjectionToken } from "./cluster-settings-menu-injection-token";

export interface ClusterIconSettingProps {
  cluster: Cluster;
  entity: KubernetesCluster;
}

interface Dependencies {
  menuItems: IComputedValue<ClusterIconMenuItem[]>
  showErrorNotification: ShowNotification;
}


const NonInjectedClusterIconSetting = observer((props: ClusterIconSettingProps & Dependencies) => {
  const element = React.createRef<HTMLDivElement>();
  const { cluster, entity } = props;

  const onIconPick = async ([file]: File[]) => {
    if (!file) {
      return;
    }

    try {
      const buf = Buffer.from(await file.arrayBuffer());

      cluster.preferences.icon = `data:${file.type};base64,${buf.toString("base64")}`;
    } catch (e) {
      props.showErrorNotification(String(e))
    }
  }

  const onUploadClick = () => {
    element
      .current
      ?.querySelector<HTMLInputElement>("input[type=file]")
      ?.click();
  }

  const save = ([kind, value]: [kind: keyof ClusterPreferences, value: any]) => {
    cluster.preferences[kind] = value
  }

  return (
    <div ref={element}>
      <div className="file-loader flex flex-row items-center">
        <div className="mr-5">
          <FilePicker
            accept="image/*"
            label={(
              <Avatar
                colorHash={`${entity.getName()}-${entity.metadata.source}`}
                title={entity.getName()}
                src={entity.spec.icon?.src}
                size={53}
              />
            )}
            onOverSizeLimit={OverSizeLimitStyle.FILTER}
            handler={onIconPick}
          />
        </div>
        <MenuActions
          id={`menu-actions-for-cluster-icon-settings-for-${entity.getId()}`}
          toolbar={false}
          autoCloseOnSelect={true}
          triggerIcon={{ material: "more_horiz" }}
        >
          <MenuItem onClick={onUploadClick}>
            Upload Icon
          </MenuItem>
          {props.menuItems.get().map(item =>
            <MenuItem onClick={() => save(item.onClick(cluster.preferences))} key={item.id} disabled={item.disabled(cluster.preferences)}>{item.title}</MenuItem>
          )}
        </MenuActions>
      </div>
    </div>
  );
});

export const ClusterIconSetting = withInjectables<Dependencies, ClusterIconSettingProps>(NonInjectedClusterIconSetting, {
  getProps: (di, props) => {
   const computedInjectMany = di.inject(computedInjectManyInjectable);
   
   return {
    ...props,
    menuItems: computedInjectMany(clusterIconSettingsMenuInjectionToken),
    showErrorNotification: di.inject(showErrorNotificationInjectable),
   }
  }
});