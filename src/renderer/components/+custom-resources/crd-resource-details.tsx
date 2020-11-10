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
import { AdditionalPrinterColumnsV1, CustomResourceDefinition } from "../../api/endpoints/crd.api";

interface Props extends KubeObjectDetailsProps<CustomResourceDefinition> {
}

function convertSpecValue(value: any): any {
  if (Array.isArray(value)) {
    return value.map(convertSpecValue)
  }

  if (typeof value === "object") {
    return (
      <Input
        readOnly
        multiLine
        theme="round-black"
        className="box grow"
        value={JSON.stringify(value, null, 2)}
      />
    )
  }

  return value
}

@observer
export class CrdResourceDetails extends React.Component<Props> {
  @computed get crd() {
    return crdStore.getByObject(this.props.object);
  }

  renderAdditionalColumns(crd: CustomResourceDefinition, columns: AdditionalPrinterColumnsV1[]) {
    return columns.map(({ name, jsonPath: jp }) => (
      <DrawerItem key={name} name={name} renderBoolean>
        {convertSpecValue(jsonPath.value(crd, jp.slice(1)))}
      </DrawerItem>
    ))
  }

  renderStatus(crd: CustomResourceDefinition, columns: AdditionalPrinterColumnsV1[]) {
    const showStatus = !columns.find(column => column.name == "Status") && crd.status?.conditions;
    if (!showStatus) {
      return null
    }

    const conditions = crd.status.conditions
      .filter(({ type, reason }) => type || reason)
      .map(({ type, reason, message, status }) => ({ kind: type || reason, message, status }))
      .map(({ kind, message, status }, index) => (
        <Badge
          key={kind + index} label={kind}
          className={cssNames({ disabled: status === "False" }, kind.toLowerCase())}
          tooltip={message}
        />
      ))

    return (
      <DrawerItem name={<Trans>Status</Trans>} className="status" labelsOnly>
        {conditions}
      </DrawerItem>
    )
  }

  render() {
    const { props: { object }, crd } = this;
    if (!object || !crd) {
      return null;
    }

    const className = cssNames("CrdResourceDetails", crd.getResourceKind());
    const extraColumns = crd.getPrinterColumns();

    return (
      <div className={className}>
        <KubeObjectMeta object={object} />
        {this.renderAdditionalColumns(object, extraColumns)}
        {this.renderStatus(object, extraColumns)}
      </div>
    )
  }
}
