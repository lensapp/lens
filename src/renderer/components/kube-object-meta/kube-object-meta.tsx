/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { KubeMetaField, KubeObject } from "../../../common/k8s-api/kube-object";
import { DrawerItem, DrawerItemLabels } from "../drawer";
import { Link } from "react-router-dom";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { LocaleDate } from "../locale-date";
import { getDetailsUrl } from "../kube-detail-params";
import logger from "../../../common/logger";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import type { IKubeObjectRef } from "../../../common/k8s-api/kube-api-parse";
import lookupApiLinkInjectable from "../../../common/k8s-api/lookup-api-link.injectable";

export interface KubeObjectMetaProps {
  object: KubeObject;
  hideFields?: KubeMetaField[];
}

interface Dependencies {
  lookupApiLink: (ref: IKubeObjectRef, parentObject?: KubeObject) => string;
}

const defaultHiddenFields: KubeMetaField[] = [
  "uid",
  "resourceVersion",
  "selfLink",
];

const NonInjectedKubeObjectMeta = observer(({ lookupApiLink, object, hideFields = defaultHiddenFields }: Dependencies & KubeObjectMetaProps) => {
  const hiddenFields = new Set(hideFields);

  if (!object) {
    return null;
  }

  if (!(object instanceof KubeObject)) {
    logger.error("[KubeObjectMeta]: passed object that is not an instanceof KubeObject", object);

    return null;
  }

  const {
    getNs, getLabels, getResourceVersion, selfLink, getAnnotations,
    getFinalizers, getId, getAge, getName, metadata: { creationTimestamp },
  } = object;
  const ownerRefs = object.getOwnerRefs();

  return (
    <>
      <DrawerItem name="Created" hidden={hiddenFields.has("creationTimestamp")}>
        {getAge(true, false)} ago ({<LocaleDate date={creationTimestamp} />})
      </DrawerItem>
      <DrawerItem name="Name" hidden={hiddenFields.has("name")}>
        {getName()}
        <KubeObjectStatusIcon key="icon" object={object} />
      </DrawerItem>
      <DrawerItem name="Namespace" hidden={hiddenFields.has("namespace") || !getNs()}>
        {getNs()}
      </DrawerItem>
      <DrawerItem name="UID" hidden={hiddenFields.has("uid")}>
        {getId()}
      </DrawerItem>
      <DrawerItem name="Link" hidden={hiddenFields.has("selfLink")}>
        {selfLink}
      </DrawerItem>
      <DrawerItem name="Resource Version" hidden={hiddenFields.has("resourceVersion")}>
        {getResourceVersion()}
      </DrawerItem>
      <DrawerItemLabels
        name="Labels"
        labels={getLabels()}
        hidden={hiddenFields.has("labels")}
      />
      <DrawerItemLabels
        name="Annotations"
        labels={getAnnotations()}
        hidden={hiddenFields.has("annotations")}
      />
      <DrawerItemLabels
        name="Finalizers"
        labels={getFinalizers()}
        hidden={hiddenFields.has("finalizers")}
      />
      {ownerRefs?.length > 0 &&
        <DrawerItem name="Controlled By" hidden={hiddenFields.has("ownerReferences")}>
          {
            ownerRefs.map(ref => {
              const { name, kind } = ref;

              return (
                <p key={name}>
                  {kind} <Link to={getDetailsUrl(lookupApiLink(ref, object))}>{name}</Link>
                </p>
              );
            })
          }
        </DrawerItem>
      }
    </>
  );
});

export const KubeObjectMeta = withInjectables<Dependencies, KubeObjectMetaProps>(NonInjectedKubeObjectMeta, {
  getProps: (di, props) => ({
    lookupApiLink: di.inject(lookupApiLinkInjectable),
    ...props,
  }),
});
