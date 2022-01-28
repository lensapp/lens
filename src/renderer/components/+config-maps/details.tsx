/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import React, { useEffect, useState } from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { DrawerTitle } from "../drawer";
import { Notifications } from "../notifications";
import { Input } from "../input";
import { Button } from "../button";
import type { ConfigMapStore } from "./store";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { ConfigMap } from "../../../common/k8s-api/endpoints";
import { KubeObjectMeta } from "../kube-object-meta";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import configMapStoreInjectable from "./store.injectable";

export interface ConfigMapDetailsProps extends KubeObjectDetailsProps<ConfigMap> {
}

interface Dependencies {
  configMapStore: ConfigMapStore;
}

const NonInjectedConfigMapDetails = observer(({ configMapStore, object: configMap }: Dependencies & ConfigMapDetailsProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [data] = useState(observable.map<string, string>());

  useEffect(() => {
    if (configMap) {
      data.replace(configMap.data);
    }
  }, [configMap]);

  if (!configMap) {
    return null;
  }

  if (!(configMap instanceof ConfigMap)) {
    logger.error("[ConfigMapDetails]: passed object that is not an instanceof ConfigMap", configMap);

    return null;
  }

  const save = async () => {
    try {
      setIsSaving(true);
      await configMapStore.update(configMap, {
        ...configMap,
        data: Object.fromEntries(data),
      });
      Notifications.ok(
        <p>
          <>ConfigMap <b>{configMap.getName()}</b> successfully updated.</>
        </p>,
      );
    } catch (error) {
      Notifications.error(`Failed to save config map: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const dataList = Array.from(data.entries());

  return (
    <div className="ConfigMapDetails">
      <KubeObjectMeta object={configMap}/>
      {
        dataList.length > 0 && (
          <>
            <DrawerTitle title="Data"/>
            {
              dataList.map(([name, value]) => (
                <div key={name} className="data">
                  <div className="name">{name}</div>
                  <div className="flex gaps align-flex-start">
                    <Input
                      multiLine
                      theme="round-black"
                      className="box grow"
                      value={value}
                      onChange={v => data.set(name, v)}
                    />
                  </div>
                </div>
              ))
            }
            <Button
              primary
              label="Save" waiting={isSaving}
              className="save-btn"
              onClick={save}
            />
          </>
        )
      }
    </div>
  );
});

export const ConfigMapDetails = withInjectables<Dependencies, ConfigMapDetailsProps>(NonInjectedConfigMapDetails, {
  getProps: (di, props) => ({
    configMapStore: di.inject(configMapStoreInjectable),
    ...props,
  }),
});
