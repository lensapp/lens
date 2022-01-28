/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./resource-details.scss";

import React from "react";
import jsonPath from "jsonpath";
import { observer } from "mobx-react";
import { cssNames } from "../../utils";
import { Badge } from "../badge";
import { DrawerItem } from "../drawer";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { KubeObjectMeta } from "../kube-object-meta";
import { Input } from "../input";
import { AdditionalPrinterColumnsV1, CustomResourceDefinition } from "../../../common/k8s-api/endpoints/custom-resource-definition.api";
import { parseJsonPath } from "../../utils/jsonPath";
import { KubeObject, KubeObjectMetadata, KubeObjectStatus } from "../../../common/k8s-api/kube-object";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";

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

interface Dependencies {

}

const NonInjectedCustomResourceDetails = observer(({ object: customResource, crd }: Dependencies & CustomResourceDetailsProps) => {
  if (!customResource || !crd) {
    return null;
  }

  if (!(customResource instanceof KubeObject)) {
    logger.error("[CrdResourceDetails]: passed object that is not an instanceof KubeObject", customResource);

    return null;
  }

  if (!(crd instanceof CustomResourceDefinition)) {
    logger.error("[CrdResourceDetails]: passed crd that is not an instanceof CustomResourceDefinition", crd);

    return null;
  }

  const renderAdditionalColumns = (resource: KubeObject, columns: AdditionalPrinterColumnsV1[]) => {
    return columns.map(({ name, jsonPath: jp }) => (
      <DrawerItem key={name} name={name} renderBoolean>
        {convertSpecValue(jsonPath.value(resource, parseJsonPath(jp.slice(1))))}
      </DrawerItem>
    ));
  };

  const renderStatus = (customResource: KubeObject<KubeObjectMetadata, KubeObjectStatus, any>, columns: AdditionalPrinterColumnsV1[]) => {
    const showStatus = !columns.find(column => column.name == "Status") && Array.isArray(customResource.status?.conditions);

    if (!showStatus) {
      return null;
    }

    const conditions = customResource.status.conditions
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
  };

  const extraColumns = crd.getPrinterColumns();

  return (
    <div className={cssNames("CrdResourceDetails", crd.getResourceKind())}>
      <KubeObjectMeta object={customResource} />
      {renderAdditionalColumns(customResource, extraColumns)}
      {renderStatus(customResource, extraColumns)}
    </div>
  );
});

export const CustomResourceDetails = withInjectables<Dependencies, CustomResourceDetailsProps>(NonInjectedCustomResourceDetails, {
  getProps: (di, props) => ({

    ...props,
  }),
});

