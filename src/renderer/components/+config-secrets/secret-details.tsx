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
import isEmpty from "lodash/isEmpty";
import { autorun, observable, makeObservable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Input } from "../input";
import { Button } from "../button";
import { Notifications } from "../notifications";
import { base64 } from "../../utils";
import { Icon } from "../icon";
import { secretsStore } from "./secrets.store";
import type { KubeObjectDetailsProps } from "../kube-object";
import type { Secret } from "../../api/endpoints";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";

interface Props extends KubeObjectDetailsProps<Secret> {
}

@observer
export class SecretDetails extends React.Component<Props> {
  @observable isSaving = false;
  @observable data: { [name: string]: string } = {};
  @observable revealSecret: { [name: string]: boolean } = {};

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
          this.revealSecret = {};
        }
      })
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

  render() {
    const { object: secret } = this.props;

    if (!secret) return null;

    return (
      <div className="SecretDetails">
        <KubeObjectMeta object={secret}/>
        <DrawerItem name="Type">
          {secret.type}
        </DrawerItem>
        {!isEmpty(this.data) && (
          <>
            <DrawerTitle title="Data"/>
            {
              Object.entries(this.data).map(([name, value]) => {
                const revealSecret = this.revealSecret[name];
                let decodedVal = "";

                try {
                  decodedVal = base64.decode(value);
                } catch {
                  decodedVal = "";
                }
                value = revealSecret ? decodedVal : value;

                return (
                  <div key={name} className="data">
                    <div className="name">{name}</div>
                    <div className="flex gaps align-center">
                      <Input
                        multiLine
                        theme="round-black"
                        className="box grow"
                        value={value || ""}
                        onChange={value => this.editData(name, value, !revealSecret)}
                      />
                      {decodedVal && (
                        <Icon
                          material={`visibility${revealSecret ? "" : "_off"}`}
                          tooltip={revealSecret ? "Hide" : "Show"}
                          onClick={() => this.revealSecret[name] = !revealSecret}
                        />)
                      }
                    </div>
                  </div>
                );
              })
            }
            <Button
              primary
              label="Save" waiting={this.isSaving}
              className="save-btn"
              onClick={this.saveSecret}
            />
          </>
        )}
      </div>
    );
  }
}
