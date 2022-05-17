/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./config-map-details.scss";

import React from "react";
import { autorun, makeObservable, observable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerTitle } from "../drawer";
import { Notifications } from "../notifications";
import { Input } from "../input";
import { Button } from "../button";
import { configMapStore } from "./legacy-store";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { ConfigMap } from "../../../common/k8s-api/endpoints";
import { KubeObjectMeta } from "../kube-object-meta";
import logger from "../../../common/logger";

export interface ConfigMapDetailsProps extends KubeObjectDetailsProps<ConfigMap> {
}

@observer
export class ConfigMapDetails extends React.Component<ConfigMapDetailsProps> {
  @observable isSaving = false;
  @observable data = observable.map<string, string | undefined>();

  constructor(props: ConfigMapDetailsProps) {
    super(props);
    makeObservable(this);
  }

  async componentDidMount() {
    disposeOnUnmount(this, [
      autorun(() => {
        const { object: configMap } = this.props;

        if (configMap) {
          this.data.replace(configMap.data); // refresh
        }
      }),
    ]);
  }

  save = async () => {
    const { object: configMap } = this.props;

    try {
      this.isSaving = true;
      await configMapStore.update(configMap, {
        ...configMap,
        data: Object.fromEntries(this.data),
      });
      Notifications.ok((
        <p>
          {"ConfigMap "}
          <b>{configMap.getName()}</b>
          {" successfully updated."}
        </p>
      ));
    } catch (error) {
      Notifications.error(`Failed to save config map: ${error}`);
    } finally {
      this.isSaving = false;
    }
  };

  render() {
    const { object: configMap } = this.props;

    if (!configMap) {
      return null;
    }

    if (!(configMap instanceof ConfigMap)) {
      logger.error("[ConfigMapDetails]: passed object that is not an instanceof ConfigMap", configMap);

      return null;
    }

    const data = Array.from(this.data.entries());

    return (
      <div className="ConfigMapDetails">
        <KubeObjectMeta object={configMap}/>
        {
          data.length > 0 && (
            <>
              <DrawerTitle>Data</DrawerTitle>
              {
                data.map(([name, value]) => (
                  <div key={name} className="data">
                    <div className="name">{name}</div>
                    <div className="flex gaps align-flex-start">
                      <Input
                        multiLine
                        theme="round-black"
                        className="box grow"
                        value={value}
                        onChange={v => this.data.set(name, v)}
                      />
                    </div>
                  </div>
                ))
              }
              <Button
                primary
                label="Save"
                waiting={this.isSaving}
                className="save-btn"
                onClick={this.save}
              />
            </>
          )
        }
      </div>
    );
  }
}
