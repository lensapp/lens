/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import { autorun } from "mobx";
import React, { useEffect } from "react";
import type { ConfigMapStore } from "../../+config-maps/store";
import configMapStoreInjectable from "../../+config-maps/store.injectable";
import { SecretKey } from "../../+config-secrets/secret-key";
import type { SecretStore } from "../../+config-secrets/store";
import secretStoreInjectable from "../../+config-secrets/store.injectable";
import type { EnvFromSource } from "../../../../common/k8s-api/endpoints";
import type { Logger } from "../../../../common/logger";
import loggerInjectable from "../../../../common/logger.injectable";
import { iter, object } from "../../../utils";

export interface ContainerEnvFromSourceProps {
  envFrom: EnvFromSource[];
  namespace: string;
}

interface Dependencies {
  secretStore: SecretStore;
  configMapStore: ConfigMapStore;
  logger: Logger;
}

const NonInjectedContainerEnvFromSource = ({
  envFrom,
  namespace,
  configMapStore,
  secretStore,
  logger,
}: ContainerEnvFromSourceProps & Dependencies) => {
  useEffect(() => autorun(() => {
    for (const { configMapRef, secretRef } of envFrom) {
      if (secretRef?.name) {
        secretStore
          .load({ name: secretRef.name, namespace })
          .catch(error => logger.warn(`[CONTAINER-ENV]: failed to load Secret ${secretRef.name} in ns=${namespace}`, error));
      }

      if (configMapRef?.name) {
        configMapStore
          .load({ name: configMapRef.name, namespace })
          .catch(error => logger.warn(`[CONTAINER-ENV]: failed to load ConfigMap ${configMapRef.name} in ns=${namespace}`, error));
      }
    }
  }), []);

  const renderValue = (testIdName: string, fieldName: string, kind: "configmap" | "secret", value: JSX.Element | string) => (
    <div
      className="variable"
      key={fieldName}
      data-testid={`envFrom-${kind}-${testIdName}`}
    >
      <span className="var-name">{fieldName}</span>
      {`= `}
      {value}
    </div>
  );

  const renderEnvFromConfigMap = (configMapName: string) => {
    const configMap = configMapStore.getByName(configMapName, namespace);

    return object.entries(configMap?.data ?? {})
      .map(([fieldName, value]) => renderValue(
        `${configMapName}:${fieldName}`,
        fieldName,
        "configmap",
        value,
      ));
  };

  const renderEnvFromSecret = (secretName: string) => {
    const secret = secretStore.getByName(secretName, namespace);

    if (!secret) return null;

    return Object.keys(secret.data)
      .map(fieldName => renderValue(
        `${secretName}:${fieldName}`,
        fieldName,
        "secret",
        <SecretKey
          secret={secret}
          field={fieldName}
        />,
      ));
  };

  return (
    <>
      {
        Array.from(iter.filterFlatMap(envFrom, vars => {
          if (vars.configMapRef?.name) {
            return renderEnvFromConfigMap(vars.configMapRef.name);
          }

          if (vars.secretRef?.name) {
            return renderEnvFromSecret(vars.secretRef.name);
          }

          return null;
        }))
      }
    </>
  );
};

export const ContainerEnvFromSource = withInjectables<Dependencies, ContainerEnvFromSourceProps>(NonInjectedContainerEnvFromSource, {
  getProps: (di, props) => ({
    ...props,
    configMapStore: di.inject(configMapStoreInjectable),
    secretStore: di.inject(secretStoreInjectable),
    logger: di.inject(loggerInjectable),
  }),
});
