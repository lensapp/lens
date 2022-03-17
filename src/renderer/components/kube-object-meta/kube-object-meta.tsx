/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { KubeMetaField } from "../../../common/k8s-api/kube-object";
import { KubeObject } from "../../../common/k8s-api/kube-object";
import { DrawerItem, DrawerItemLabels } from "../drawer";
import { apiManager } from "../../../common/k8s-api/api-manager";
import { Link } from "react-router-dom";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { LocaleDate } from "../locale-date";
import { getDetailsUrl } from "../kube-detail-params";
import logger from "../../../common/logger";
import { KubeObjectAge } from "../kube-object/age";

export interface KubeObjectMetaProps {
  object: KubeObject;
  hideFields?: KubeMetaField[];
}

export class KubeObjectMeta extends React.Component<KubeObjectMetaProps> {
  static defaultHiddenFields: KubeMetaField[] = [
    "uid", "resourceVersion", "selfLink",
  ];

  isHidden(field: KubeMetaField): boolean {
    const { hideFields = KubeObjectMeta.defaultHiddenFields } = this.props;

    return hideFields.includes(field);
  }

  render() {
    const { object } = this.props;

    if (!object) {
      return null;
    }

    if (!(object instanceof KubeObject)) {
      logger.error("[KubeObjectMeta]: passed object that is not an instanceof KubeObject", object);

      return null;
    }

    const {
      getNs, getLabels, getResourceVersion, selfLink, getAnnotations,
      getFinalizers, getId, getName, metadata: { creationTimestamp },
    } = object;
    const ownerRefs = object.getOwnerRefs();

    return (
      <>
        <DrawerItem name="Created" hidden={this.isHidden("creationTimestamp")}>
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
        <DrawerItem name="Name" hidden={this.isHidden("name")}>
          {getName()}
          <KubeObjectStatusIcon key="icon" object={object} />
        </DrawerItem>
        <DrawerItem name="Namespace" hidden={this.isHidden("namespace") || !getNs()}>
          {getNs()}
        </DrawerItem>
        <DrawerItem name="UID" hidden={this.isHidden("uid")}>
          {getId()}
        </DrawerItem>
        <DrawerItem name="Link" hidden={this.isHidden("selfLink")}>
          {selfLink}
        </DrawerItem>
        <DrawerItem name="Resource Version" hidden={this.isHidden("resourceVersion")}>
          {getResourceVersion()}
        </DrawerItem>
        <DrawerItemLabels
          name="Labels"
          labels={getLabels()}
          hidden={this.isHidden("labels")}
        />
        <DrawerItemLabels
          name="Annotations"
          labels={getAnnotations()}
          hidden={this.isHidden("annotations")}
        />
        <DrawerItemLabels
          name="Finalizers"
          labels={getFinalizers()}
          hidden={this.isHidden("finalizers")}
        />
        {ownerRefs?.length > 0 && (
          <DrawerItem name="Controlled By" hidden={this.isHidden("ownerReferences")}>
            {
              ownerRefs.map(ref => {
                const { name, kind } = ref;
                const ownerDetailsUrl = getDetailsUrl(apiManager.lookupApiLink(ref, object));

                return (
                  <p key={name}>
                    {kind}
                    {" "}
                    <Link to={ownerDetailsUrl}>{name}</Link>
                  </p>
                );
              })
            }
          </DrawerItem>
        )}
      </>
    );
  }
}
