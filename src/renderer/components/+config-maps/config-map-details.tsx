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

import "./config-map-details.scss";

import React from "react";
import { autorun, observable } from "mobx";
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
  @observable data = observable.map();

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
      await configMapsStore.update(configMap, { ...configMap, data: this.data.toJSON() });
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
    const data = Object.entries(this.data.toJSON());

    return (
      <div className="ConfigMapDetails">
        <KubeObjectMeta object={configMap}/>
        {
          data.length > 0 && (
            <>
              <DrawerTitle title="Data"/>
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


