/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pod-container-env.scss";

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import type { IPodContainer, Secret } from "../../../common/k8s-api/endpoints";
import { DrawerItem } from "../drawer";
import { autorun } from "mobx";
import { secretStore } from "../+config-secrets/secrets.store";
import { configMapStore } from "../+config-maps/config-maps.store";
import { Icon } from "../icon";
import { base64, cssNames, iter } from "../../utils";
import _ from "lodash";

export interface ContainerEnvironmentProps {
  container: IPodContainer;
  namespace: string;
}

export const ContainerEnvironment = observer((props: ContainerEnvironmentProps) => {
  const { container: { env, envFrom = [] }, namespace } = props;

  useEffect( () => autorun(() => {
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
          secretValue = (
            <SecretKey
              reference={secretKeyRef}
              namespace={namespace}
            />
          );
        }

        if (configMapKeyRef) {
          const { name, key } = configMapKeyRef;
          const configMap = configMapStore.getByName(name, namespace);

          secretValue = configMap ?
            configMap.data[key] :
            `configMapKeyRef(${name}${key})`;
        }
      }

      return (
        <div className="variable" key={name}>
          <span className="var-name">{name}</span>
          :
          {secretValue}
        </div>
      );
    });
  };

  const renderEnvFrom = () => {
    return Array.from(iter.filterFlatMap(envFrom, vars => {
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
      <div className="variable" key={name}>
        <span className="var-name">{name}</span>
        :
        {value}
      </div>
    ));
  };

  const renderEnvFromSecret = (secretName: string) => {
    const secret = secretStore.getByName(secretName, namespace);

    if (!secret) return null;

    return Object.keys(secret.data).map(key => {
      const secretKeyRef = {
        name: secret.getName(),
        key,
      };

      const value = (
        <SecretKey
          reference={secretKeyRef}
          namespace={namespace}
        />
      );

      return (
        <div className="variable" key={key}>
          <span className="var-name">{key}</span>
          :
          {value}
        </div>
      );
    });
  };

  return (
    <DrawerItem name="Environment" className="ContainerEnvironment">
      {env && renderEnv()}
      {envFrom && renderEnvFrom()}
    </DrawerItem>
  );
});

export interface SecretKeyProps {
  reference: {
    name: string;
    key: string;
  };
  namespace: string;
}

const SecretKey = (props: SecretKeyProps) => {
  const { reference: { name, key }, namespace } = props;
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState<Secret>();

  const showKey = async (evt: React.MouseEvent) => {
    evt.preventDefault();
    setLoading(true);
    const secret = await secretStore.load({ name, namespace });

    setLoading(false);
    setSecret(secret);
  };

  const value = secret?.data?.[key];

  if (value) {
    return <>{base64.decode(value)}</>;
  }

  return (
    <>
      {`secretKeyRef(${name}.${key})`}
      &nbsp;
      <Icon
        className={cssNames("secret-button", { loading })}
        material="visibility"
        tooltip="Show"
        onClick={showKey}
      />
    </>
  );
};
