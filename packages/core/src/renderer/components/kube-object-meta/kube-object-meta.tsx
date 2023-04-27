/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { KubeMetaField } from "@k8slens/kube-object";
import { KubeObject } from "@k8slens/kube-object";
import { DrawerItem, DrawerItemLabels } from "../drawer";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import { Link } from "react-router-dom";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { LocaleDate } from "../locale-date";
import type { Logger } from "../../../common/logger";
import { KubeObjectAge } from "../kube-object/age";
import type { GetDetailsUrl } from "../kube-detail-params/get-details-url.injectable";
import { observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import getDetailsUrlInjectable from "../kube-detail-params/get-details-url.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import type { NamespaceApi } from "../../../common/k8s-api/endpoints";
import namespaceApiInjectable from "../../../common/k8s-api/endpoints/namespace.api.injectable";

export interface KubeObjectMetaProps {
  object: KubeObject;
  hideFields?: KubeMetaField[];
}

interface Dependencies {
  getDetailsUrl: GetDetailsUrl;
  apiManager: ApiManager;
  namespaceApi: NamespaceApi;
  logger: Logger;
}

const NonInjectedKubeObjectMeta = observer((props : Dependencies & KubeObjectMetaProps) => {
  const {
    apiManager,
    getDetailsUrl,
    object,
    hideFields = [
      "uid",
      "resourceVersion",
      "selfLink",
    ],
    logger,
    namespaceApi,
  } = props;

  if (!object) {
    return null;
  }

  if (!(object instanceof KubeObject)) {
    logger.error("[KubeObjectMeta]: passed object that is not an instanceof KubeObject", object);

    return null;
  }

  const isHidden = (field: KubeMetaField) => hideFields.includes(field);

  const { selfLink, metadata: { creationTimestamp }} = object;
  const ownerRefs = object.getOwnerRefs();
  const namespace = object.getNs();
  const namespaceDetailsUrl = namespace
    ? getDetailsUrl(namespaceApi.formatUrlForNotListing({ name: namespace }))
    : "";

  return (
    <>
      <DrawerItem name="Created" hidden={isHidden("creationTimestamp") || !creationTimestamp}>
        <KubeObjectAge object={object} compact={false} />
        {" ago "}
        {creationTimestamp && <LocaleDate date={creationTimestamp} />}
      </DrawerItem>
      <DrawerItem name="Name" hidden={isHidden("name")}>
        {object.getName()}
        <KubeObjectStatusIcon key="icon" object={object} />
      </DrawerItem>
      <DrawerItem name="Namespace" hidden={isHidden("namespace") || !namespace}>
        <Link to={namespaceDetailsUrl}>{namespace}</Link>
      </DrawerItem>
      <DrawerItem name="UID" hidden={isHidden("uid")}>
        {object.getId()}
      </DrawerItem>
      <DrawerItem name="Link" hidden={isHidden("selfLink")}>
        {selfLink}
      </DrawerItem>
      <DrawerItem name="Resource Version" hidden={isHidden("resourceVersion")}>
        {object.getResourceVersion()}
      </DrawerItem>
      <DrawerItemLabels
        name="Labels"
        labels={object.getLabels()}
        hidden={isHidden("labels")}
      />
      <DrawerItemLabels
        name="Annotations"
        labels={object.getAnnotations()}
        hidden={isHidden("annotations")}
      />
      <DrawerItemLabels
        name="Finalizers"
        labels={object.getFinalizers()}
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
    logger: di.inject(loggerInjectable),
    namespaceApi: di.inject(namespaceApiInjectable),
  }),
});
