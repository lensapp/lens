import "./secret-details.scss";

import React from "react";
import isEmpty from "lodash/isEmpty";
import { autorun, observable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Input } from "../input";
import { Button } from "../button";
import { Notifications } from "../notifications";
import { base64 } from "../../utils";
import { Icon } from "../icon";
import { secretsStore } from "./secrets.store";
import { KubeObjectDetailsProps } from "../kube-object";
import { Secret } from "../../api/endpoints";
import { _i18n } from "../../i18n";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";

interface Props extends KubeObjectDetailsProps<Secret> {
}

@observer
export class SecretDetails extends React.Component<Props> {
  @observable isSaving = false;
  @observable data: { [name: string]: string } = {};
  @observable revealSecret: { [name: string]: boolean } = {};

  async componentDidMount() {
    disposeOnUnmount(this, [
      autorun(() => {
        const { object: secret } = this.props;
        if (secret) {
          this.data = secret.data;
          this.revealSecret = {};
        }
      })
    ])
  }

  saveSecret = async () => {
    const { object: secret } = this.props;
    this.isSaving = true;
    try {
      await secretsStore.update(secret, { ...secret, data: this.data });
      Notifications.ok(<Trans>Secret successfully updated.</Trans>);
    } catch (err) {
      Notifications.error(err);
    }
    this.isSaving = false;
  }

  editData = (name: string, value: string, encoded: boolean) => {
    this.data[name] = encoded ? value : base64.encode(value);
  }

  render() {
    const { object: secret } = this.props;
    if (!secret) return null;
    return (
      <div className="SecretDetails">
        <KubeObjectMeta object={secret}/>
        <DrawerItem name={<Trans>Type</Trans>}>
          {secret.type}
        </DrawerItem>
        {!isEmpty(this.data) && (
          <>
            <DrawerTitle title={_i18n._(t`Data`)}/>
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
                          tooltip={revealSecret ? <Trans>Hide</Trans> : <Trans>Show</Trans>}
                          onClick={() => this.revealSecret[name] = !revealSecret}
                        />)
                      }
                    </div>
                  </div>
                )
              })
            }
            <Button
              primary
              label={_i18n._(t`Save`)} waiting={this.isSaving}
              className="save-btn"
              onClick={this.saveSecret}
            />
          </>
        )}
      </div>
    );
  }
}

kubeObjectDetailRegistry.add({
  kind: "Secret",
  apiVersions: ["v1"],
  components: {
    Details: (props) => <SecretDetails {...props} />
  }
})
