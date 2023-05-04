/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pod-container-env.scss";

import React, { useEffect, useRef } from "react";
import { observer } from "mobx-react";
import type { ConfigMap, Container, Secret } from "@k8slens/kube-object";
import { DrawerItem } from "../drawer";
import { autorun, observable } from "mobx";
import { getOrInsertWith, object } from "@k8slens/utilities";
import _ from "lodash";
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
import { asyncComputed, withInjectables } from "@ogre-tools/injectable-react";
import { SecretKey } from "./secret-key";
import type { RequestSecret } from "../config-secrets/request-secret.injectable";
import requestSecretInjectable from "../config-secrets/request-secret.injectable";
import type { RequestConfigMap } from "../config-maps/request-config-map.injectable";
import requestConfigMapInjectable from "../config-maps/request-config-map.injectable";

export interface ContainerEnvironmentProps {
  container: Container;
  namespace: string;
}

interface Dependencies {
  requestConfigMap: RequestConfigMap;
  requestSecret: RequestSecret;
}

const NonInjectedContainerEnvironment = observer((props: Dependencies & ContainerEnvironmentProps) => {
  const {
    container: { env = [], envFrom = [] },
    namespace,
    requestConfigMap,
    requestSecret,
  } = props;

  const secrets = useRef(observable.map<string, IAsyncComputed<Secret>>());
  const configMaps = useRef(observable.map<string, IAsyncComputed<ConfigMap>>());

  useEffect( () => autorun(() => {
    for (const { valueFrom } of env) {
      const { configMapKeyRef: { name } = { name: undefined }} = valueFrom ?? {};

      if (name) {
        getOrInsertWith(configMaps.current, name, () => asyncComputed({
          betweenUpdates: "show-latest-value",
          valueWhenPending: undefined,
          getValueFromObservedPromise: () => requestConfigMap({ name, namespace }),
        }));
      }
    }

    for (const { configMapRef, secretRef } of envFrom) {
      if (secretRef?.name) {
        getOrInsertWith(secrets.current, secretRef.name, () => asyncComputed({
          betweenUpdates: "show-latest-value",
          valueWhenPending: undefined,
          getValueFromObservedPromise: () => requestSecret({ name: secretRef.name, namespace }),
        }));
      }

      if (configMapRef?.name) {
        getOrInsertWith(configMaps.current, configMapRef.name, () => asyncComputed({
          betweenUpdates: "show-latest-value",
          valueWhenPending: undefined,
          getValueFromObservedPromise: () => requestConfigMap({ name: configMapRef.name, namespace }),
        }));
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

          secretValue = `fieldRef(${apiVersion ?? "v1"}:${fieldPath})`;
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
          const configMap = configMaps.current.get(name)?.value.get();

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
    const configMap = configMaps.current.get(configMapName)?.value.get();

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
    const secret = secrets.current.get(secretName)?.value.get();

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
      {renderEnv()}
      {renderEnvFrom()}
    </DrawerItem>
  );
});

export const ContainerEnvironment = withInjectables<Dependencies, ContainerEnvironmentProps>(NonInjectedContainerEnvironment, {
  getProps: (di, props) => ({
    ...props,
    requestConfigMap: di.inject(requestConfigMapInjectable),
    requestSecret: di.inject(requestSecretInjectable),
  }),
});
