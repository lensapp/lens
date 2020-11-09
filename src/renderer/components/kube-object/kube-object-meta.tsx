import React from "react";
import { Trans } from "@lingui/macro";
import { IKubeMetaField, KubeObject } from "../../api/kube-object";
import { DrawerItem, DrawerItemLabels } from "../drawer";
import { getDetailsUrl } from "../../navigation";
import { lookupApiLink } from "../../api/kube-api";
import { Link } from "react-router-dom";

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
    const object = this.props.object
    const {
      getName, getNs, getLabels, getResourceVersion, selfLink,
      getAnnotations, getFinalizers, getId, getAge,
      metadata: { creationTimestamp },
    } = object;

    const ownerRefs = object.getOwnerRefs();
    return (
      <>
        <DrawerItem name={<Trans>Created</Trans>} hidden={this.isHidden("creationTimestamp")}>
          {getAge(true, false)} <Trans>ago</Trans> ({creationTimestamp})
        </DrawerItem>
        <DrawerItem name={<Trans>Name</Trans>} hidden={this.isHidden("name")}>
          {getName()}
        </DrawerItem>
        <DrawerItem name={<Trans>Namespace</Trans>} hidden={this.isHidden("namespace") || !getNs()}>
          {getNs()}
        </DrawerItem>
        <DrawerItem name={<Trans>UID</Trans>} hidden={this.isHidden("uid")}>
          {getId()}
        </DrawerItem>
        <DrawerItem name={<Trans>Link</Trans>} hidden={this.isHidden("selfLink")}>
          {selfLink}
        </DrawerItem>
        <DrawerItem name={<Trans>Resource Version</Trans>} hidden={this.isHidden("resourceVersion")}>
          {getResourceVersion()}
        </DrawerItem>
        <DrawerItemLabels
          name={<Trans>Labels</Trans>}
          labels={getLabels()}
          hidden={this.isHidden("labels")}
        />
        <DrawerItemLabels
          name={<Trans>Annotations</Trans>}
          labels={getAnnotations()}
          hidden={this.isHidden("annotations")}
        />
        <DrawerItemLabels
          name={<Trans>Finalizers</Trans>}
          labels={getFinalizers()}
          hidden={this.isHidden("finalizers")}
        />
        {ownerRefs && ownerRefs.length > 0 &&
        <DrawerItem name={<Trans>Controlled By</Trans>} hidden={this.isHidden("ownerReferences")}>
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
    )
  }
}
