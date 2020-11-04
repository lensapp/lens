import "./crd-resource-details.scss";

import React from "react";
import jsonPath from "jsonpath";
import { Trans } from "@lingui/macro";
import { observer } from "mobx-react";
import { computed } from "mobx";
import { cssNames } from "../../utils";
import { Badge } from "../badge";
import { DrawerItem } from "../drawer";
import { KubeObjectDetailsProps } from "../kube-object";
import { crdStore } from "./crd.store";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { Input } from "../input";
import { CustomResourceDefinition } from "../../api/endpoints/crd.api";

interface Props extends KubeObjectDetailsProps<CustomResourceDefinition> {
}

function CrdColumnValue({ value }: { value: any[] | {} | string }) {
  if (Array.isArray(value)) {
    return <>{value.map((item, index) => <CrdColumnValue key={index} value={item} />)}</>
  }
  if (typeof(value) === 'object') return (
    <Input
      readOnly
      multiLine
      theme="round-black"
      className="box grow"
      value={JSON.stringify(value, null, 2)}
    />
  );
  return <span>{value}</span>;
}
@observer
export class CrdResourceDetails extends React.Component<Props> {
  @computed get crd() {
    return crdStore.getByObject(this.props.object);
  }

  render() {
    const { object } = this.props;
    const { crd } = this;
    if (!object || !crd) return null;
    const className = cssNames("CrdResourceDetails", crd.getResourceKind());
    const extraColumns = crd.getPrinterColumns();
    const showStatus = !extraColumns.find(column => column.name == "Status") && object.status?.conditions;
    return (
      <div className={className}>
        <KubeObjectMeta object={object}/>
        {extraColumns.map(column => {
          const { name } = column;
          const value = jsonPath.query(object, (column.jsonPath).slice(1));
          return (
            <DrawerItem key={name} name={name}>
              <CrdColumnValue value={value} />
            </DrawerItem>
          )
        })}
        {showStatus && (
          <DrawerItem name={<Trans>Status</Trans>} className="status" labelsOnly>
            {object.status.conditions.map((condition, index) => {
              const { type, reason, message, status } = condition;
              const kind = type || reason;
              if (!kind) return null;
              return (
                <Badge
                  key={kind + index} label={kind}
                  className={cssNames({ disabled: status === "False" }, kind.toLowerCase())}
                  tooltip={message}
                />
              );
            })}
          </DrawerItem>
        )}
      </div>
    )
  }
}
