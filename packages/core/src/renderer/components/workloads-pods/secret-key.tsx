/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React, { useState } from "react";
import type { EnvVarKeySelector } from "@k8slens/kube-object";
import { Icon } from "@k8slens/icon";
import { base64, cssNames, isObject } from "@k8slens/utilities";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { SetRequired } from "type-fest";
import type { RequestSecret } from "../config-secrets/request-secret.injectable";
import requestSecretInjectable from "../config-secrets/request-secret.injectable";

export interface SecretKeyProps {
  reference: SetRequired<EnvVarKeySelector, "name">;
  namespace: string;
}

interface Dependencies {
  requestSecret: RequestSecret;
}

const NonInjectedSecretKey = (props: SecretKeyProps & Dependencies) => {
  const {
    reference: { name, key }, namespace, requestSecret,
  } = props;

  const [loading, setLoading] = useState(false);
  const [secretData, setSecretData] = useState<string>();

  if (!name) {
    return null;
  }

  const showKey = (evt: React.MouseEvent) => {
    evt.preventDefault();
    setLoading(true);

    void (async () => {
      try {
        const secret = await requestSecret({ name, namespace });

        try {
          setSecretData(base64.decode(secret.data[key] ?? ""));
        } catch {
          setSecretData(secret.data[key]);
        }
      } catch (error) {
        if (error instanceof Error) {
          setSecretData(`${String(error)}`);
        } else if (isObject(error)) {
          setSecretData(`Error: ${JSON.stringify(error)}`);
        } else {
          setSecretData(`Error: ${String(error)}`);
        }
      } finally {
        setLoading(false);
      }
    })();
  };

  if (secretData) {
    return <>{secretData}</>;
  }

  return (
    <>
      {`secret(${name})[${key}]`}
      &nbsp;
      <Icon
        className={cssNames("secret-button", { loading })}
        material="visibility"
        tooltip="Show"
        disabled={loading}
        onClick={showKey}
        data-testid={`show-secret-button-for-${namespace}/${name}:${key}`}
      />
    </>
  );
};

export const SecretKey = withInjectables<Dependencies, SecretKeyProps>(NonInjectedSecretKey, {
  getProps: (di, props) => ({
    ...props,
    requestSecret: di.inject(requestSecretInjectable),
  }),
});
