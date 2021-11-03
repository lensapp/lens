/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "./secret-details.scss";

import React from "react";
import { autorun, observable, makeObservable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Input } from "../input";
import { Button } from "../button";
import { Notifications } from "../notifications";
import { base64, ObservableToggleSet } from "../../utils";
import { Icon } from "../icon";
import { secretsStore } from "./secrets.store";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { Secret } from "../../../common/k8s-api/endpoints";
import { KubeObjectMeta } from "../kube-object-meta";
import logger from "../../../common/logger";

interface Props extends KubeObjectDetailsProps<Secret> {
}

@observer
export class SecretDetails extends React.Component<Props> {
  @observable isSaving = false;
  @observable data: { [name: string]: string } = {};
  revealSecret = new ObservableToggleSet<string>();

  constructor(props: Props) {
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
      await secretsStore.update(secret, { ...secret, data: this.data });
      Notifications.ok("Secret successfully updated.");
    } catch (err) {
      Notifications.error(err);
    }
    this.isSaving = false;
  };

  editData = (name: string, value: string, encoded: boolean) => {
    this.data[name] = encoded ? value : base64.encode(value);
  };

  renderSecret = ([name, value]: [string, string]) => {
    let decodedVal: string | undefined;

    try {
      decodedVal = base64.decode(value);
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
      <div key={name} className="data" data-testid={`${name}-secret-entry`}>
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
              onClick={() => this.revealSecret.toggle(name)}
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
        <DrawerTitle title="Data" />
        {secrets.map(this.renderSecret)}
        <Button
          primary
          label="Save" waiting={this.isSaving}
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
