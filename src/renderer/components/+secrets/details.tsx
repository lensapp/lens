/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import React, { useEffect, useState } from "react";
import { autorun } from "mobx";
import { observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Input } from "../input";
import { Button } from "../button";
import { Notifications } from "../notifications";
import { base64, ObservableToggleSet } from "../../utils";
import { Icon } from "../icon";
import type { SecretStore } from "./store";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { Secret } from "../../../common/k8s-api/endpoints";
import { KubeObjectMeta } from "../kube-object-meta";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import secretStoreInjectable from "./store.injectable";

export interface SecretDetailsProps extends KubeObjectDetailsProps<Secret> {
}

interface Dependencies {
  secretStore: SecretStore;
}

const NonInjectedSecretDetails = observer(({ secretStore, object: secret }: Dependencies & SecretDetailsProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState<Record<string, string | undefined>>({});
  const [secretsToReveal] = useState(new ObservableToggleSet<string>());

  useEffect(() => autorun(() => {
    if (secret) {
      setData(secret.data);
      secretsToReveal.clear();
    }
  }), []);

  if (!secret) {
    return null;
  }

  if (!(secret instanceof Secret)) {
    logger.error("[SecretDetails]: passed object that is not an instanceof Secret", secret);

    return null;
  }

  const saveSecret = async () => {
    setIsSaving(true);

    try {
      await secretStore.update(secret, { ...secret, data });
      Notifications.ok("Secret successfully updated.");
    } catch (err) {
      Notifications.error(err);
    }

    setIsSaving(false);
  };

  const editData = (name: string, value: string, encoded: boolean) => {
    data[name] = encoded ? value : base64.encode(value);
  };

  const renderSecret = ([name, value]: [string, string]) => {
    let decodedVal: string | undefined;

    try {
      decodedVal = base64.decode(value);
    } catch {
      /**
       * The value failed to be decoded, so don't show the visibility
       * toggle until the value is saved
       */
      secretsToReveal.delete(name);
    }

    const revealSecret = secretsToReveal.has(name);

    if (revealSecret && typeof decodedVal === "string") {
      value = decodedVal;
    }

    return (
      <div key={name} className="data" data-testid={`${name}-secret-entry`}>
        <div className="name">{name}</div>
        <div className="flex gaps align-center">
          <Input
            multiLine
            theme="round-black"
            className="box grow"
            value={value || ""}
            onChange={value => editData(name, value, !revealSecret)}
          />
          {typeof decodedVal === "string" && (
            <Icon
              material={revealSecret ? "visibility" : "visibility_off"}
              tooltip={revealSecret ? "Hide" : "Show"}
              onClick={() => secretsToReveal.toggle(name)}
            />
          )}
        </div>
      </div>
    );
  };

  const renderData = () => {
    const secrets = Object.entries(data);

    if (secrets.length === 0) {
      return null;
    }

    return (
      <>
        <DrawerTitle title="Data" />
        {secrets.map(renderSecret)}
        <Button
          primary
          label="Save" waiting={isSaving}
          className="save-btn"
          onClick={saveSecret}
        />
      </>
    );
  };

  return (
    <div className="SecretDetails">
      <KubeObjectMeta object={secret}/>
      <DrawerItem name="Type">
        {secret.type}
      </DrawerItem>
      {renderData()}
    </div>
  );
});

export const SecretDetails = withInjectables<Dependencies, SecretDetailsProps>(NonInjectedSecretDetails, {
  getProps: (di, props) => ({
    secretStore: di.inject(secretStoreInjectable),
    ...props,
  }),
});

