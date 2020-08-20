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
import { apiManager } from "../../api/api-manager";
import { crdStore } from "./crd.store";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { Input } from "../input";

interface Props extends KubeObjectDetailsProps {
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

  @computed get CustomDetailsViews() {
    return apiManager.getViews(this.props.object.selfLink).Details;
  }

  render() {
    const { object } = this.props;
    const { crd, CustomDetailsViews } = this;
    if (!object || !crd) return null;
    const className = cssNames("CrdResourceDetails", crd.getResourceKind());
    const extraColumns = crd.getPrinterColumns();
    const showStatus = !extraColumns.find(column => column.name == "Status") && object.status?.conditions;
    if (CustomDetailsViews) {
      return <CustomDetailsViews className={className} object={object}/>
    }
    return (
      <div className={className}>
        <KubeObjectMeta object={object}/>
        {extraColumns.map(column => {
          const { name } = column;
          const value = jsonPath.query(object, column.JSONPath.slice(1));
          return (
            <DrawerItem key={name} name={name}>
              <CrdColumnValue value={value} />
            </DrawerItem>
          )
        })}
        {showStatus && (
          <DrawerItem name={<Trans>Status</Trans>} className="status" labelsOnly>
            {object.status.conditions.map((condition: { type: string; message: string; status: string }) => {
              const { type, message, status } = condition;
              return (
                <Badge
                  key={type} label={type}
                  className={cssNames({ disabled: status === "False" }, type.toLowerCase())}
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
