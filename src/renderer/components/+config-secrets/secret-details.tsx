/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./secret-details.scss";

import React from "react";
import { autorun, observable, makeObservable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Input } from "../input";
import { Button } from "../button";
import { Notifications } from "../notifications";
import { base64, toggle } from "../../utils";
import { Icon } from "../icon";
import { secretStore } from "./legacy-store";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { Secret } from "../../../common/k8s-api/endpoints";
import { KubeObjectMeta } from "../kube-object-meta";
import logger from "../../../common/logger";

export interface SecretDetailsProps extends KubeObjectDetailsProps<Secret> {
}

@observer
export class SecretDetails extends React.Component<SecretDetailsProps> {
  @observable isSaving = false;
  @observable data: Partial<Record<string, string>> = {};
  @observable revealSecret = observable.set<string>();

  constructor(props: SecretDetailsProps) {
    super(props);
    makeObservable(this);
  }

  async componentDidMount() {
    disposeOnUnmount(this, [
      autorun(() => {
        const { object: secret } = this.props;

        if (secret) {
          this.data = secret.data;
          this.revealSecret.clear();
        }
      }),
    ]);
  }

  saveSecret = async () => {
    const { object: secret } = this.props;

    this.isSaving = true;

    try {
      await secretStore.update(secret, { ...secret, data: this.data });
      Notifications.ok("Secret successfully updated.");
    } catch (err) {
      Notifications.checkedError(err, "Unknown error occured while updating the secret");
    }
    this.isSaving = false;
  };

  editData = (name: string, value: string, encoded: boolean) => {
    this.data[name] = encoded ? value : base64.encode(value);
  };

  renderSecret = ([name, value]: [string, string | undefined]) => {
    let decodedVal: string | undefined;

    try {
      decodedVal = value ? base64.decode(value) : undefined;
    } catch {
      /**
       * The value failed to be decoded, so don't show the visibility
       * toggle until the value is saved
       */
      this.revealSecret.delete(name);
    }

    const revealSecret = this.revealSecret.has(name);

    if (revealSecret && typeof decodedVal === "string") {
      value = decodedVal;
    }

    return (
      <div
        key={name}
        className="data"
        data-testid={`${name}-secret-entry`}
      >
        <div className="name">{name}</div>
        <div className="flex gaps align-center">
          <Input
            multiLine
            theme="round-black"
            className="box grow"
            value={value || ""}
            onChange={value => this.editData(name, value, !revealSecret)}
          />
          {typeof decodedVal === "string" && (
            <Icon
              material={revealSecret ? "visibility" : "visibility_off"}
              tooltip={revealSecret ? "Hide" : "Show"}
              onClick={() => toggle(this.revealSecret, name)}
            />
          )}
        </div>
      </div>
    );
  };

  renderData() {
    const secrets = Object.entries(this.data);

    if (secrets.length === 0) {
      return null;
    }

    return (
      <>
        <DrawerTitle>Data</DrawerTitle>
        {secrets.map(this.renderSecret)}
        <Button
          primary
          label="Save"
          waiting={this.isSaving}
          className="save-btn"
          onClick={this.saveSecret}
        />
      </>
    );
  }

  render() {
    const { object: secret } = this.props;

    if (!secret) {
      return null;
    }

    if (!(secret instanceof Secret)) {
      logger.error("[SecretDetails]: passed object that is not an instanceof Secret", secret);

      return null;
    }

    return (
      <div className="SecretDetails">
        <KubeObjectMeta object={secret}/>
        <DrawerItem name="Type">
          {secret.type}
        </DrawerItem>
        {this.renderData()}
      </div>
    );
  }
}
