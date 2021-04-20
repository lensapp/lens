import "./config-map-details.scss";

import React from "react";
import { observable, reaction, makeObservable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerTitle } from "../drawer";
import { Notifications } from "../notifications";
import { Input } from "../input";
import { Button } from "../button";
import { KubeEventDetails } from "../+events/kube-event-details";
import { configMapsStore } from "./config-maps.store";
import { KubeObjectDetailsProps } from "../kube-object";
import { ConfigMap, ConfigMapData } from "../../api/endpoints";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";

interface Props extends KubeObjectDetailsProps<ConfigMap> {
}

@observer
export class ConfigMapDetails extends React.Component<Props> {
  @observable isSaving = false;
  @observable data: ConfigMapData = {};

  @disposeOnUnmount
  autoCopyData = reaction(() => this.props.object, configMap => {
    this.data = configMap?.data ?? {}; // copy-or-update config-map's data for editing
  }, {
    fireImmediately: true,
  });

  save = async () => {
    const { object: configMap } = this.props;

    try {
      this.isSaving = true;
      await configMapsStore.update(configMap, { ...configMap, data: this.data });
      Notifications.ok(
        <p>
          <>ConfigMap <b>{configMap.getName()}</b> successfully updated.</>
        </p>
      );
    } finally {
      this.isSaving = false;
    }
  };

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  render() {
    const { object: configMap } = this.props;

    if (!configMap) {
      return null;
    }

    const dataEntries = Object.entries(this.data);

    return (
      <div className="ConfigMapDetails">
        <KubeObjectMeta object={configMap}/>
        {
          dataEntries.length > 0 && (
            <>
              <DrawerTitle title="Data"/>
              {
                dataEntries.map(([name, value]) => {
                  return (
                    <div key={name} className="data">
                      <div className="name">{name}</div>
                      <div className="flex gaps align-flex-start">
                        <Input
                          multiLine
                          theme="round-black"
                          className="box grow"
                          value={value}
                          onChange={v => this.data[name] = v}
                        />
                      </div>
                    </div>
                  );
                })
              }
              <Button
                primary
                label="Save" waiting={this.isSaving}
                className="save-btn"
                onClick={this.save}
              />
            </>
          )
        }
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
});

kubeObjectDetailRegistry.add({
  kind: "ConfigMap",
  apiVersions: ["v1"],
  priority: 5,
  components: {
    Details: (props) => <KubeEventDetails {...props} />
  }
});


