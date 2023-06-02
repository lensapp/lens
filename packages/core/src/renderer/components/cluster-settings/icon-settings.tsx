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
import type { Cluster } from "../../../common/cluster/cluster";
import { Avatar } from "../avatar";
import { FilePicker, OverSizeLimitStyle } from "../file-picker";
import { MenuActions, MenuItem } from "../menu";
import type { ShowNotification } from "@k8slens/notifications";
import { showErrorNotificationInjectable } from "@k8slens/notifications";
import { clusterIconSettingsComponentInjectionToken, clusterIconSettingsMenuInjectionToken } from "@k8slens/cluster-settings";
import type { ClusterIconMenuItem, ClusterIconSettingsComponent } from "@k8slens/cluster-settings";

export interface ClusterIconSettingProps {
  cluster: Cluster;
  entity: KubernetesCluster;
}

interface Dependencies {
  menuItems: IComputedValue<ClusterIconMenuItem[]>;
  settingComponents: IComputedValue<ClusterIconSettingsComponent[]>;
  showErrorNotification: ShowNotification;
}


const NonInjectedClusterIconSetting = observer((props: ClusterIconSettingProps & Dependencies) => {
  const element = React.createRef<HTMLDivElement>();
  const { cluster, entity } = props;
  const menuId = `menu-actions-for-cluster-icon-settings-for-${entity.getId()}`;

  const onIconPick = async ([file]: File[]) => {
    if (!file) {
      return;
    }

    try {
      const buf = Buffer.from(await file.arrayBuffer());

      cluster.preferences.icon = `data:${file.type};base64,${buf.toString("base64")}`;
    } catch (e) {
      props.showErrorNotification(String(e));
    }
  };

  const onUploadClick = () => {
    element
      .current
      ?.querySelector<HTMLInputElement>("input[type=file]")
      ?.click();
  };

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
                background={entity.spec.icon?.background}
              />
            )}
            onOverSizeLimit={OverSizeLimitStyle.FILTER}
            handler={onIconPick}
          />
        </div>
        <MenuActions
          id={menuId}
          data-testid={menuId}
          toolbar={false}
          autoCloseOnSelect={true}
          triggerIcon={{ material: "more_horiz" }}
        >
          <MenuItem onClick={onUploadClick}>
            Upload Icon
          </MenuItem>
          {props.menuItems.get().map(item => (
            <MenuItem
              onClick={() => item.onClick(cluster.preferences)}
              key={item.id}
              disabled={item.disabled?.(cluster.preferences)}>
              {item.title}
            </MenuItem>
          ),
          )}
        </MenuActions>
      </div>
      {props.settingComponents.get().map(item => {
        return (
          <item.Component
            key={item.id}
            preferences={cluster.preferences}
          />
        );
      })}
    </div>
  );
});

export const ClusterIconSetting = withInjectables<Dependencies, ClusterIconSettingProps>(NonInjectedClusterIconSetting, {
  getProps: (di, props) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);
   
    return {
      ...props,
      menuItems: computedInjectMany(clusterIconSettingsMenuInjectionToken),
      settingComponents: computedInjectMany(clusterIconSettingsComponentInjectionToken),
      showErrorNotification: di.inject(showErrorNotificationInjectable),
    };
  },
});
