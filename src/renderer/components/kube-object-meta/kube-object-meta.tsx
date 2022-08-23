/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { KubeMetaField } from "../../../common/k8s-api/kube-object";
import { KubeObject } from "../../../common/k8s-api/kube-object";
import { DrawerItem, DrawerItemLabels } from "../drawer";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import { Link } from "react-router-dom";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { LocaleDate } from "../locale-date";
import logger from "../../../common/logger";
import { KubeObjectAge } from "../kube-object/age";
import type { GetDetailsUrl } from "../kube-detail-params/get-details-url.injectable";
import { observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import getDetailsUrlInjectable from "../kube-detail-params/get-details-url.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";

export interface KubeObjectMetaProps {
  object: KubeObject;
  hideFields?: KubeMetaField[];
}

interface Dependencies {
  getDetailsUrl: GetDetailsUrl;
  apiManager: ApiManager;
}

const NonInjectedKubeObjectMeta = observer(({
  apiManager,
  getDetailsUrl,
  object,
  hideFields = [
    "uid",
    "resourceVersion",
    "selfLink",
  ],
}: Dependencies & KubeObjectMetaProps) => {
  if (!object) {
    return null;
  }

  if (!(object instanceof KubeObject)) {
    logger.error("[KubeObjectMeta]: passed object that is not an instanceof KubeObject", object);

    return null;
  }

  const isHidden = (field: KubeMetaField) => hideFields.includes(field);

  const {
    getNs, getLabels, getResourceVersion, selfLink, getAnnotations,
    getFinalizers, getId, getName, metadata: { creationTimestamp },
  } = object;
  const ownerRefs = object.getOwnerRefs();

  return (
    <>
      <DrawerItem name="Created" hidden={isHidden("creationTimestamp")}>
        <KubeObjectAge object={object} compact={false} />
        {" ago "}
        {creationTimestamp && (
          <>
            (
            <LocaleDate date={creationTimestamp} />
            )
          </>
        )}
      </DrawerItem>
      <DrawerItem name="Name" hidden={isHidden("name")}>
        {getName()}
        <KubeObjectStatusIcon key="icon" object={object} />
      </DrawerItem>
      <DrawerItem name="Namespace" hidden={isHidden("namespace") || !getNs()}>
        {getNs()}
      </DrawerItem>
      <DrawerItem name="UID" hidden={isHidden("uid")}>
        {getId()}
      </DrawerItem>
      <DrawerItem name="Link" hidden={isHidden("selfLink")}>
        {selfLink}
      </DrawerItem>
      <DrawerItem name="Resource Version" hidden={isHidden("resourceVersion")}>
        {getResourceVersion()}
      </DrawerItem>
      <DrawerItemLabels
        name="Labels"
        labels={getLabels()}
        hidden={isHidden("labels")}
      />
      <DrawerItemLabels
        name="Annotations"
        labels={getAnnotations()}
        hidden={isHidden("annotations")}
      />
      <DrawerItemLabels
        name="Finalizers"
        labels={getFinalizers()}
        hidden={isHidden("finalizers")}
      />
      {ownerRefs?.length > 0 && (
        <DrawerItem name="Controlled By" hidden={isHidden("ownerReferences")}>
          {
            ownerRefs.map(ref => (
              <p key={ref.name}>
                {`${ref.kind} `}
                <Link to={getDetailsUrl(apiManager.lookupApiLink(ref, object))}>
                  {ref.name}
                </Link>
              </p>
            ))
          }
        </DrawerItem>
      )}
    </>
  );
});

export const KubeObjectMeta = withInjectables<Dependencies, KubeObjectMetaProps>(NonInjectedKubeObjectMeta, {
  getProps: (di, props) => ({
    ...props,
    getDetailsUrl: di.inject(getDetailsUrlInjectable),
    apiManager: di.inject(apiManagerInjectable),
  }),
});
