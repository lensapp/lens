/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./config-map-details.scss";

import React from "react";
import { autorun, makeObservable, observable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerTitle } from "../drawer";
import type { ShowNotification } from "../notifications";
import { Input } from "../input";
import { Button } from "../button";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { ConfigMap } from "../../../common/k8s-api/endpoints";
import { KubeObjectMeta } from "../kube-object-meta";
import type { Logger } from "../../../common/logger";
import type { ConfigMapStore } from "./store";
import { withInjectables } from "@ogre-tools/injectable-react";
import configMapStoreInjectable from "./store.injectable";
import showSuccessNotificationInjectable from "../notifications/show-success-notification.injectable";
import showErrorNotificationInjectable from "../notifications/show-error-notification.injectable";
import loggerInjectable from "../../../common/logger.injectable";

export interface ConfigMapDetailsProps extends KubeObjectDetailsProps<ConfigMap> {
}

interface Dependencies {
  configMapStore: ConfigMapStore;
  logger: Logger;
  showSuccessNotification: ShowNotification;
  showErrorNotification: ShowNotification;
}

@observer
class NonInjectedConfigMapDetails extends React.Component<ConfigMapDetailsProps & Dependencies> {
  @observable isSaving = false;
  @observable data = observable.map<string, string | undefined>();

  constructor(props: ConfigMapDetailsProps & Dependencies) {
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
    const { object: configMap, configMapStore } = this.props;

    try {
      this.isSaving = true;
      await configMapStore.update(configMap, {
        ...configMap,
        data: Object.fromEntries(this.data),
      });
      this.props.showSuccessNotification((
        <p>
          {"ConfigMap "}
          <b>{configMap.getName()}</b>
          {" successfully updated."}
        </p>
      ));
    } catch (error) {
      this.props.showErrorNotification(`Failed to save config map: ${error}`);
    } finally {
      this.isSaving = false;
    }
  };

  render() {
    const { object: configMap, logger } = this.props;

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

export const ConfigMapDetails = withInjectables<Dependencies, ConfigMapDetailsProps>(NonInjectedConfigMapDetails, {
  getProps: (di, props) => ({
    ...props,
    configMapStore: di.inject(configMapStoreInjectable),
    showSuccessNotification: di.inject(showSuccessNotificationInjectable),
    showErrorNotification: di.inject(showErrorNotificationInjectable),
    logger: di.inject(loggerInjectable),
  }),
});
