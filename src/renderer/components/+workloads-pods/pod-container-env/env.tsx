/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import { sortBy } from "lodash";
import { autorun } from "mobx";
import React, { useEffect } from "react";
import type { ConfigMapStore } from "../../+config-maps/store";
import configMapStoreInjectable from "../../+config-maps/store.injectable";
import { SecretKey } from "../../+config-secrets/secret-key";
import type { SecretStore } from "../../+config-secrets/store";
import secretStoreInjectable from "../../+config-secrets/store.injectable";
import type { EnvVar } from "../../../../common/k8s-api/endpoints";
import type { Logger } from "../../../../common/logger";
import loggerInjectable from "../../../../common/logger.injectable";

export interface ContainerEnvProps {
  env: EnvVar[];
  namespace: string;
}

interface Dependencies {
  secretStore: SecretStore;
  configMapStore: ConfigMapStore;
  logger: Logger;
}

const NonInjectedContainerEnv = ({
  env,
  namespace,
  configMapStore,
  secretStore,
  logger,
}: ContainerEnvProps & Dependencies) => {
  useEffect(() => autorun(() => {
    for (const { valueFrom } of env) {
      if (valueFrom?.configMapKeyRef) {
        const { configMapKeyRef } = valueFrom;

        configMapStore
          .load({ name: configMapKeyRef.name, namespace })
          .catch(error => logger.warn(`[CONTAINER-ENV]: failed to load ConfigMap ${configMapKeyRef.name} in ns=${namespace}`, error));
      }

      if (valueFrom?.secretKeyRef) {
        const { secretKeyRef } = valueFrom;

        secretStore
          .load({ name: secretKeyRef.name, namespace })
          .catch(error => logger.warn(`[CONTAINER-ENV]: failed to load Secret ${secretKeyRef.name} in ns=${namespace}`, error));
      }
    }
  }), []);

  const getEnvVarValue = ({ value, valueFrom }: EnvVar) => {
    if (value) {
      return value;
    }

    if (!valueFrom) {
      return null;
    }

    const { fieldRef, secretKeyRef, configMapKeyRef } = valueFrom;

    if (fieldRef) {
      const { apiVersion, fieldPath } = fieldRef;

      return `fieldRef(${apiVersion}:${fieldPath})`;
    }

    if (secretKeyRef) {
      const secret = secretStore.getByName(secretKeyRef.name, namespace);

      if (secret) {
        return (
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

      return configMap?.data[key] ?? `configMapKeyRef(${name}${key})`;
    }

    return null;
  };

  return (
    <>
      {
        sortBy(env, "name")
          .map(envVar => ({
            name: envVar.name,
            value: getEnvVarValue(envVar),
          }))
          .filter(({ value }) => value !== null)
          .map(({ name, value }) => (
            <div
              className="variable"
              key={name}
              data-testid={`env-${name}`}
            >
              <span className="var-name">{name}</span>
              {`= `}
              {value}
            </div>
          ))
      }
    </>
  );
};

export const ContainerEnv = withInjectables<Dependencies, ContainerEnvProps>(NonInjectedContainerEnv, {
  getProps: (di, props) => ({
    ...props,
    configMapStore: di.inject(configMapStoreInjectable),
    secretStore: di.inject(secretStoreInjectable),
    logger: di.inject(loggerInjectable),
  }),
});
