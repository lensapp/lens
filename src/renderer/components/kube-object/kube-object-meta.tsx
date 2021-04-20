import React from "react";
import { IKubeMetaField, KubeObject } from "../../api/kube-object";
import { DrawerItem, DrawerItemLabels } from "../drawer";
import { lookupApiLink } from "../../api/kube-api";
import { Link } from "react-router-dom";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { LocaleDate } from "../locale-date";
import { getDetailsUrl } from "./kube-object-details";

export interface KubeObjectMetaProps {
  object: KubeObject;
  hideFields?: IKubeMetaField[];
}

export class KubeObjectMeta extends React.Component<KubeObjectMetaProps> {
  static defaultHiddenFields: IKubeMetaField[] = [
    "uid", "resourceVersion", "selfLink"
  ];

  isHidden(field: IKubeMetaField): boolean {
    const { hideFields = KubeObjectMeta.defaultHiddenFields } = this.props;

    return hideFields.includes(field);
  }

  render() {
    const object = this.props.object;
    const {
      getName, getNs, getLabels, getResourceVersion, selfLink,
      getAnnotations, getFinalizers, getId, getAge,
      metadata: { creationTimestamp },
    } = object;

    const ownerRefs = object.getOwnerRefs();

    return (
      <>
        <DrawerItem name="Created" hidden={this.isHidden("creationTimestamp")}>
          {getAge(true, false)} ago ({<LocaleDate date={creationTimestamp} />})
        </DrawerItem>
        <DrawerItem name="Name" hidden={this.isHidden("name")}>
          {getName()} <KubeObjectStatusIcon key="icon" object={object} />
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
        {ownerRefs && ownerRefs.length > 0 &&
        <DrawerItem name="Controlled By" hidden={this.isHidden("ownerReferences")}>
          {
            ownerRefs.map(ref => {
              const { name, kind } = ref;
              const ownerDetailsUrl = getDetailsUrl(lookupApiLink(ref, object));

              return (
                <p key={name}>
                  {kind} <Link to={ownerDetailsUrl}>{name}</Link>
                </p>
              );
            })
          }
        </DrawerItem>
        }
      </>
    );
  }
}
