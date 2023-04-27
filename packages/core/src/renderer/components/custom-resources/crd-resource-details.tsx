/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./crd-resource-details.scss";

import React from "react";
import { observer } from "mobx-react";
import { cssNames, safeJSONPathValue } from "@k8slens/utilities";
import { Badge } from "../badge";
import { DrawerItem } from "../drawer";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { Input } from "../input";
import type { AdditionalPrinterColumnsV1, KubeObjectMetadata, KubeObjectStatus } from "@k8slens/kube-object";
import { CustomResourceDefinition, KubeObject } from "@k8slens/kube-object";
import type { Logger } from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import loggerInjectable from "../../../common/logger.injectable";

export interface CustomResourceDetailsProps extends KubeObjectDetailsProps<KubeObject> {
  crd?: CustomResourceDefinition;
}

function convertSpecValue(value: unknown): React.ReactNode {
  if (Array.isArray(value)) {
    return (
      <ul>
        {value.map((value, index) => (
          <li key={index}>
            {convertSpecValue(value)}
          </li>
        ))}
      </ul>
    );
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

  if (
    typeof value === "boolean"
    || typeof value === "string"
    || typeof value === "number"
  ) {
    return value.toString();
  }

  return null;
}

interface Dependencies {
  logger: Logger;
}

@observer
class NonInjectedCustomResourceDetails extends React.Component<CustomResourceDetailsProps & Dependencies> {
  renderAdditionalColumns(resource: KubeObject, columns: AdditionalPrinterColumnsV1[]) {
    return columns.map(({ name, jsonPath }) => (
      <DrawerItem key={name} name={name}>
        {convertSpecValue(safeJSONPathValue(resource, jsonPath))}
      </DrawerItem>
    ));
  }

  renderStatus(cr: KubeObject, columns: AdditionalPrinterColumnsV1[]) {
    const customResource = cr as KubeObject<KubeObjectMetadata, KubeObjectStatus, unknown>;
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
          key={`${kind}${index}`}
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
    const { props: { object, crd, logger }} = this;

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
        {this.renderAdditionalColumns(object, extraColumns)}
        {this.renderStatus(object, extraColumns)}
      </div>
    );
  }
}

export const CustomResourceDetails = withInjectables<Dependencies, CustomResourceDetailsProps>(NonInjectedCustomResourceDetails, {
  getProps: (di, props) => ({
    ...props,
    logger: di.inject(loggerInjectable),
  }),
});
