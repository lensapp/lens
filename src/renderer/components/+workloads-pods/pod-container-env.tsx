/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pod-container-env.scss";

import React, { useEffect } from "react";
import { observer } from "mobx-react";
import type { PodContainer } from "../../../common/k8s-api/endpoints";
import { DrawerItem } from "../drawer";
import { autorun } from "mobx";
import { iter } from "../../utils";
import _ from "lodash";
import type { SecretStore } from "../+config-secrets/store";
import type { ConfigMapStore } from "../+config-maps/store";
import { withInjectables } from "@ogre-tools/injectable-react";
import configMapStoreInjectable from "../+config-maps/store.injectable";
import secretStoreInjectable from "../+config-secrets/store.injectable";
import { SecretKey } from "../+config-secrets/secret-key";

export interface ContainerEnvironmentProps {
  container: PodContainer;
  namespace: string;
}

interface Dependencies {
  secretStore: SecretStore;
  configMapStore: ConfigMapStore;
}

const NonInjectedContainerEnvironment = observer((props: ContainerEnvironmentProps & Dependencies) => {
  const {
    container: { env, envFrom },
    namespace,
    configMapStore,
    secretStore,
  } = props;

  useEffect(() => autorun(() => {
    for (const { valueFrom } of env ?? []) {
      if (valueFrom?.configMapKeyRef) {
        configMapStore.load({ name: valueFrom.configMapKeyRef.name, namespace });
      }
    }

    for (const { configMapRef, secretRef } of envFrom ?? []) {
      if (secretRef?.name) {
        secretStore.load({ name: secretRef.name, namespace });
      }

      if (configMapRef?.name) {
        configMapStore.load({ name: configMapRef.name, namespace });
      }
    }
  }), []);

  const renderEnv = () => {
    const orderedEnv = _.sortBy(env, "name");

    return orderedEnv.map(variable => {
      const { name, value, valueFrom } = variable;
      let secretValue = null;

      if (value) {
        secretValue = value;
      }

      if (valueFrom) {
        const { fieldRef, secretKeyRef, configMapKeyRef } = valueFrom;

        if (fieldRef) {
          const { apiVersion, fieldPath } = fieldRef;

          secretValue = `fieldRef(${apiVersion}:${fieldPath})`;
        }

        if (secretKeyRef) {
          const secret = secretStore.getByName(secretKeyRef.name, namespace);

          if (secret) {
            secretValue = (
              <SecretKey
                secret={secret}
                field={secretKeyRef.key}
              />
            );
          }
        }

        if (configMapKeyRef) {
          const { name, key } = configMapKeyRef;
          const configMap = configMapStore.getByName(name, namespace);

          secretValue = configMap
            ? configMap.data[key]
            : `configMapKeyRef(${name}${key})`;
        }
      }

      return (
        <div
          className="variable"
          key={name}
          data-testid={`env-${name}`}
        >
          <span className="var-name">{name}</span>
          {`= `}
          {secretValue}
        </div>
      );
    });
  };

  const renderEnvFrom = () => {
    return Array.from(iter.filterFlatMap(envFrom ?? [], vars => {
      if (vars.configMapRef?.name) {
        return renderEnvFromConfigMap(vars.configMapRef.name);
      }

      if (vars.secretRef?.name) {
        return renderEnvFromSecret(vars.secretRef.name);
      }

      return null;
    }));
  };

  const renderEnvFromConfigMap = (configMapName: string) => {
    const configMap = configMapStore.getByName(configMapName, namespace);

    if (!configMap) return null;

    return Object.entries(configMap.data).map(([name, value]) => (
      <div
        className="variable"
        key={name}
        data-testid={`envFrom-configmap-${configMap.getName()}`}
      >
        <span className="var-name">{name}</span>
        {`= `}
        {value}
      </div>
    ));
  };

  const renderEnvFromSecret = (secretName: string) => {
    const secret = secretStore.getByName(secretName, namespace);

    if (!secret) return null;

    return Object.keys(secret.data)
      .map(name => (
        <div
          className="variable"
          key={name}
          data-testid={`envFrom-secret-${secretName}-${name}`}
        >
          <span className="var-name">{name}</span>
          {`= `}
          <SecretKey
            secret={secret}
            field={name}
          />
        </div>
      ));
  };

  return (
    <DrawerItem name="Environment" className="ContainerEnvironment">
      {renderEnv()}
      {renderEnvFrom()}
    </DrawerItem>
  );
});

export const ContainerEnvironment = withInjectables<Dependencies, ContainerEnvironmentProps>(NonInjectedContainerEnvironment, {
  getProps: (di, props) => ({
    ...props,
    configMapStore: di.inject(configMapStoreInjectable),
    secretStore: di.inject(secretStoreInjectable),
  }),
});
