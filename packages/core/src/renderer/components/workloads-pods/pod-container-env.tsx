/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pod-container-env.scss";

import React, { useEffect } from "react";
import { observer } from "mobx-react";
import type { Container } from "@k8slens/kube-object";
import { DrawerItem } from "../drawer";
import { autorun } from "mobx";
import { object } from "@k8slens/utilities";
import _ from "lodash";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { ConfigMapStore } from "../config-maps/store";
import type { SecretStore } from "../config-secrets/store";
import configMapStoreInjectable from "../config-maps/store.injectable";
import secretStoreInjectable from "../config-secrets/store.injectable";
import { SecretKey } from "./secret-key";

export interface ContainerEnvironmentProps {
  container: Container;
  namespace: string;
}

interface Dependencies {
  configMapStore: ConfigMapStore;
  secretStore: SecretStore;
}

const NonInjectedContainerEnvironment = observer((props: Dependencies & ContainerEnvironmentProps) => {
  const {
    container: { env, envFrom = [] },
    namespace,
    configMapStore,
    secretStore,
  } = props;

  useEffect( () => autorun(() => {
    for (const { valueFrom } of env ?? []) {
      if (valueFrom?.configMapKeyRef?.name) {
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
      } else if (valueFrom) {
        const { fieldRef, secretKeyRef, configMapKeyRef } = valueFrom;

        if (fieldRef) {
          const { apiVersion, fieldPath } = fieldRef;

          secretValue = `fieldRef(${apiVersion}:${fieldPath})`;
        } else if (secretKeyRef?.name) {
          secretValue = (
            <SecretKey
              reference={{
                ...secretKeyRef,
                name: secretKeyRef.name,
              }}
              namespace={namespace}
            />
          );
        } else if (configMapKeyRef?.name) {
          const { name, key } = configMapKeyRef;
          const configMap = configMapStore.getByName(name, namespace);

          secretValue = configMap
            ? configMap.data[key]
            : `configMapKeyRef(${name}${key})`;
        }
      }

      return (
        <div className="variable" key={name}>
          <span className="var-name">{name}</span>
          {` : `}
          {secretValue}
        </div>
      );
    });
  };

  const renderEnvFrom = () => (
    envFrom
      .flatMap(({ configMapRef, secretRef, prefix }) => {
        if (configMapRef?.name) {
          return renderEnvFromConfigMap(configMapRef.name, prefix);
        }

        if (secretRef?.name) {
          return renderEnvFromSecret(secretRef.name, prefix);
        }

        return null;
      })
  );

  const renderEnvFromConfigMap = (configMapName: string, prefix: string | undefined) => {
    const configMap = configMapStore.getByName(configMapName, namespace);

    if (!configMap) return null;

    return object.entries(configMap.data)
      .map(([name, value]) => (
        <div className="variable" key={name}>
          <span className="var-name">
            {prefix}
            {name}
          </span>
          {` : `}
          {value}
        </div>
      ));
  };

  const renderEnvFromSecret = (secretName: string, prefix: string | undefined) => {
    const secret = secretStore.getByName(secretName, namespace);

    if (!secret) return null;

    return Object.keys(secret.data)
      .map(key => (
        <div className="variable" key={key}>
          <span className="var-name">
            {prefix}
            {key}
          </span>
          {` : `}
          <SecretKey
            reference={{
              name: secret.getName(),
              key,
            }}
            namespace={namespace}
          />
        </div>
      ));
  };

  return (
    <DrawerItem name="Environment" className="ContainerEnvironment">
      {env && renderEnv()}
      {envFrom && renderEnvFrom()}
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
