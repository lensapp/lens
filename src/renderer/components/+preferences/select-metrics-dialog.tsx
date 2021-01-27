import "./select-metrics-dialog.scss";

import React from "react";
import { observer } from "mobx-react";
import { observable } from "mobx";
import { Dialog, DialogProps } from "../dialog/dialog";
import { Checkbox } from "../checkbox/checkbox";
import { Wizard, WizardStep } from "../wizard/wizard";
import { userStore } from "../../../common/user-store";
import { Select, SelectOption } from "../select/select";
import { Icon } from "../icon/icon";
import { components, PlaceholderProps } from "react-select";

interface Props extends Partial<DialogProps> {
}

export enum ResourceType {
  Cluster = "Cluster",
  Node = "Node",
  Pod = "Pod",
  Deployment = "Deployment",
  StatefulSet = "StatefulSet",
  Container = "Container",
  Ingress = "Ingress",
  VolumeClaim = "VolumeClaim",
  ReplicaSet = "ReplicaSet",
  DaemonSet = "DaemonSet",
}

const Placeholder = observer((props: PlaceholderProps<any>) => {
  const getPlaceholder = (): React.ReactNode => {
    if (userStore.hiddenMetrics.size >= 1) {
      return <>Metrics: {Array.from(userStore.hiddenMetrics).join(", ")}</>;
    }
    else {
      return <>Select metrics...</>;
    }
  };

  return (
    <components.Placeholder {...props}>
      {getPlaceholder()}
    </components.Placeholder>
  );
});

@observer
export class SelectMetricsDialog extends React.Component<Props> {

  @observable static isOpen = false;

  static open() {
    SelectMetricsDialog.isOpen = true;
  }

  static close() {
    SelectMetricsDialog.isOpen = false;
  }

  onChange(values: ResourceType[]) {
    values.map(value => {
      if (userStore.hiddenMetrics.has(value)) {
        userStore.hiddenMetrics.delete(value);
      } else {
        userStore.hiddenMetrics.add(value);
      }
    });
  }

  reset = () => {
    userStore.hiddenMetrics.clear();
    userStore.preferences.hideMetrics = false;
  };

  render() {
    const { ...dialogProps } = this.props;
    const header = <h5>Select metrics to hide</h5>;

    return (
      <Dialog
        {...dialogProps}
        isOpen={SelectMetricsDialog.isOpen}
        close={SelectMetricsDialog.close}
      >
        <Wizard header={header} done={SelectMetricsDialog.close}>
          <WizardStep contentClass="flow column" nextLabel={"Reset"} next={this.reset} prevLabel={"Close"}>
            <div>
              <Select
                className={"SelectMetricsDialog"}
                components={{ Placeholder }}
                isMulti
                closeMenuOnSelect={false}
                isDisabled={userStore.preferences.hideMetrics}
                options={Object.values(ResourceType)}
                onChange={(options: SelectOption[]) => {
                  this.onChange(options.map(option => option.value));
                }}
                formatOptionLabel={({ value: resource }: SelectOption) => {
                  const isSelected = userStore.hiddenMetrics.has(resource);

                  return (
                    <div className="flex gaps align-center">
                      <span>{resource}</span>
                      {isSelected && <Icon small material="check" className="box right"/>}
                    </div>
                  );
                }}
              />
            </div>
            <Checkbox
              label="Hide metrics for all resources"
              value={userStore.preferences.hideMetrics}
              onChange={v => userStore.preferences.hideMetrics = v}
            />
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
