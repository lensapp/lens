import "./config-map-details.scss";

import React from "react";
import { autorun, makeObservable, observable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
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
  @observable data = observable.map<string, string>();

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  async componentDidMount() {
    disposeOnUnmount(this, [
      autorun(() => {
        const { object: configMap } = this.props;

        if (configMap) {
          this.data.replace(configMap.data); // refresh
        }
      })
    ]);
  }

  save = async () => {
    const { object: configMap } = this.props;

    try {
      this.isSaving = true;
      await configMapsStore.update(configMap, {
        ...configMap,
        data: Object.fromEntries(this.data),
      });
      Notifications.ok(
        <p>
          <>ConfigMap <b>{configMap.getName()}</b> successfully updated.</>
        </p>
      );
    } finally {
      this.isSaving = false;
    }
  };

  render() {
    const { object: configMap } = this.props;

    if (!configMap) return null;
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
                          onChange={v => this.data.set(name, v)}
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


