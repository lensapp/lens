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

import "./crd-resource-details.scss";

import React from "react";
import jsonPath from "jsonpath";
import { observer } from "mobx-react";
import { computed, makeObservable } from "mobx";
import { cssNames } from "../../utils";
import { Badge } from "../badge";
import { DrawerItem } from "../drawer";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { crdStore } from "./crd.store";
import { KubeObjectMeta } from "../kube-object-meta";
import { Input } from "../input";
import type { AdditionalPrinterColumnsV1, CustomResourceDefinition } from "../../api/endpoints/crd.api";
import { parseJsonPath } from "../../utils/jsonPath";

interface Props extends KubeObjectDetailsProps<CustomResourceDefinition> {
}

function convertSpecValue(value: any): any {
  if (Array.isArray(value)) {
    return value.map(convertSpecValue);
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
    );
  }

  return value;
}

@observer
export class CrdResourceDetails extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  @computed get crd() {
    return crdStore.getByObject(this.props.object);
  }

  renderAdditionalColumns(crd: CustomResourceDefinition, columns: AdditionalPrinterColumnsV1[]) {
    return columns.map(({ name, jsonPath: jp }) => (
      <DrawerItem key={name} name={name} renderBoolean>
        {convertSpecValue(jsonPath.value(crd, parseJsonPath(jp.slice(1))))}
      </DrawerItem>
    ));
  }

  renderStatus(crd: CustomResourceDefinition, columns: AdditionalPrinterColumnsV1[]) {
    const showStatus = !columns.find(column => column.name == "Status") && crd.status?.conditions;

    if (!showStatus) {
      return null;
    }

    const conditions = crd.status.conditions
      .filter(({ type, reason }) => type || reason)
      .map(({ type, reason, message, status }) => ({ kind: type || reason, message, status }))
      .map(({ kind, message, status }, index) => (
        <Badge
          key={kind + index} label={kind}
          disabled={status === "False"}
          className={kind.toLowerCase()}
          tooltip={message}
        />
      ));

    return (
      <DrawerItem name="Status" className="status" labelsOnly>
        {conditions}
      </DrawerItem>
    );
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
    );
  }
}
