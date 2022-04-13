/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./crd-resource-details.scss";

import React from "react";
import { observer } from "mobx-react";
import { cssNames } from "../../utils";
import { Badge } from "../badge";
import { DrawerItem } from "../drawer";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { KubeObjectMeta } from "../kube-object-meta";
import { Input } from "../input";
import type { AdditionalPrinterColumnsV1 } from "../../../common/k8s-api/endpoints/custom-resource-definition.api";
import { CustomResourceDefinition } from "../../../common/k8s-api/endpoints/custom-resource-definition.api";
import { convertKubectlJsonPathToNodeJsonPath } from "../../utils/jsonPath";
import type { KubeObjectStatus } from "../../../common/k8s-api/kube-object";
import { KubeObject } from "../../../common/k8s-api/kube-object";
import logger from "../../../common/logger";
import { JSONPath } from "@astronautlabs/jsonpath";

export interface CustomResourceDetailsProps extends KubeObjectDetailsProps<KubeObject> {
  crd: CustomResourceDefinition;
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
export class CustomResourceDetails extends React.Component<CustomResourceDetailsProps> {
  renderAdditionalColumns(resource: KubeObject, columns: AdditionalPrinterColumnsV1[]) {
    return columns.map(({ name, jsonPath }) => (
      <DrawerItem
        key={name}
        name={name}
        renderBoolean
      >
        {convertSpecValue(JSONPath.query(resource, convertKubectlJsonPathToNodeJsonPath(jsonPath)))}
      </DrawerItem>
    ));
  }

  renderStatus(customResource: KubeObject<KubeObjectStatus, unknown>, columns: AdditionalPrinterColumnsV1[]) {
    const showStatus = !columns.find(column => column.name == "Status") && Array.isArray(customResource.status?.conditions);

    if (!showStatus) {
      return null;
    }

    const conditions = customResource.status?.conditions
      ?.filter(({ type, reason }) => type || reason)
      .map(({ type, reason, message, status }) => ({
        kind: type || reason || "<unknown>",
        message,
        status,
      }))
      .map(({ kind, message, status }, index) => (
        <Badge
          key={kind + index}
          label={kind}
          disabled={status === "False"}
          className={kind.toLowerCase()}
          tooltip={message}
        />
      ));

    return (
      <DrawerItem
        name="Status"
        className="status"
        labelsOnly
      >
        {conditions}
      </DrawerItem>
    );
  }

  render() {
    const { props: { object, crd }} = this;

    if (!object || !crd) {
      return null;
    }

    if (!(object instanceof KubeObject)) {
      logger.error("[CrdResourceDetails]: passed object that is not an instanceof KubeObject", object);

      return null;
    }

    if (!(crd instanceof CustomResourceDefinition)) {
      logger.error("[CrdResourceDetails]: passed crd that is not an instanceof CustomResourceDefinition", crd);

      return null;
    }

    const extraColumns = crd.getPrinterColumns();

    return (
      <div className={cssNames("CrdResourceDetails", crd.getResourceKind())}>
        <KubeObjectMeta object={object} />
        {this.renderAdditionalColumns(object, extraColumns)}
        {this.renderStatus(object, extraColumns)}
      </div>
    );
  }
}
