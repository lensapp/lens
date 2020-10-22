import "./config-map-details.scss";

import React from "react";
import { autorun, observable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { DrawerTitle } from "../drawer";
import { Notifications } from "../notifications";
import { Input } from "../input";
import { Button } from "../button";
import { KubeEventDetails } from "../+events/kube-event-details";
import { configMapsStore } from "./config-maps.store";
import { KubeObjectDetailsProps } from "../kube-object";
import { ConfigMap } from "../../api/endpoints";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";

interface Props extends KubeObjectDetailsProps<ConfigMap> {
}

@observer
export class ConfigMapDetails extends React.Component<Props> {
  @observable isSaving = false;
  @observable data = observable.map();

  async componentDidMount() {
    disposeOnUnmount(this, [
      autorun(() => {
        const { object: configMap } = this.props;
        if (configMap) {
          this.data.replace(configMap.data); // refresh
        }
      })
    ])
  }

  save = async () => {
    const { object: configMap } = this.props;
    try {
      this.isSaving = true;
      await configMapsStore.update(configMap, { ...configMap, data: this.data.toJSON() });
      Notifications.ok(
        <p>
          <Trans>ConfigMap <b>{configMap.getName()}</b> successfully updated.</Trans>
        </p>
      );
    } finally {
      this.isSaving = false;
    }
  }

  render() {
    const { object: configMap } = this.props;
    if (!configMap) return null;
    const data = Object.entries(this.data.toJSON());
    return (
      <div className="ConfigMapDetails">
        <KubeObjectMeta object={configMap}/>
        {
          data.length > 0 && (
            <>
              <DrawerTitle title={<Trans>Data</Trans>}/>
              {
                data.map(([name, value]) => {
                  return (
                    <div key={name} className="data">
                      <div className="name">{name}</div>
                      <div className="flex gaps align-flex-start">
                        <Input
                          multiLine
                          theme="round-black"
                          className="box grow"
                          value={value}
                          onChange={v => this.data.set(name, v)}
                        />
                      </div>
                    </div>
                  )
                })
              }
              <Button
                primary
                label={<Trans>Save</Trans>} waiting={this.isSaving}
                className="save-btn"
                onClick={this.save}
              />
            </>
          )
        }

        <KubeEventDetails object={configMap}/>
      </div>
    );
  }
}

kubeObjectDetailRegistry.add({
  kind: "ConfigMap",
  apiVersions: ["v1"],
  components: {
    Details: (props) => <ConfigMapDetails {...props} />
  }
})
