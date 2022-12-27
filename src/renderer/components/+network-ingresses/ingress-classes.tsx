/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./ingress-classes.module.scss";

import React from "react";
import { observer } from "mobx-react";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IngressClassStore } from "./ingress-class-store";
import ingressClassStoreInjectable from "./ingress-class-store.injectable";
import type { IngressClass } from "../../../common/k8s-api/endpoints/ingress-class.api";
import { Icon } from "../icon";
import { cssNames } from "../../utils";
import { KubeObjectMenu } from "../kube-object-menu";

enum columnId {
  name = "name",
  namespace = "namespace",
  controller = "controller",
  apiGroup = "apiGroup",
  scope = "scope", // "Namespace" | "Cluster"
  kind = "kind", // "ClusterIngressParameter" | "IngressParameter"
}

interface Dependencies {
  store: IngressClassStore;
}

const NonInjectedIngressClasses = observer((props: Dependencies) => {
  const {
    store,
  } = props;

  return (
    <SiblingsInTabLayout>
      <KubeObjectListLayout
        isConfigurable
        tableId="network_ingress_classess"
        className={styles.IngressClasses}
        store={store}
        sortingCallbacks={{
          [columnId.name]: (resource: IngressClass) => resource.getName(),
          [columnId.namespace]: (resource: IngressClass) => resource.getNs(),
          [columnId.controller]: (resource: IngressClass) => resource.getController(),
          [columnId.apiGroup]: (resource: IngressClass) => resource.getApiGroup(),
          [columnId.scope]: (resource: IngressClass) => resource.getScope(),
          [columnId.kind]: (resource: IngressClass) => resource.getKind(),
        }}
        searchFilters={[
          ingress => ingress.getSearchFields(),
        ]}
        renderHeaderTitle="Ingress Classes"
        renderTableHeader={[
          { title: "Name", className: styles.name, sortBy: columnId.name, id: columnId.name },
          {
            title: "Namespace",
            className: styles.namespace,
            sortBy: columnId.namespace,
            id: columnId.namespace,
          },
          {
            title: "Controller",
            className: styles.controller,
            sortBy: columnId.controller,
            id: columnId.controller,
          },
          {
            title: "API Group",
            className: styles.apiGroup,
            sortBy: columnId.apiGroup,
            id: columnId.apiGroup,
          },
          { title: "Scope", className: styles.scope, sortBy: columnId.scope, id: columnId.scope },
          { title: "Kind", className: styles.kind, sortBy: columnId.kind, id: columnId.kind },
        ]}
        renderTableContents={(ingressClass: IngressClass) => [
          <div key={ingressClass.getId()} className={cssNames(styles.name)}>
            {ingressClass.getName()}
            {" "}
            {ingressClass.isDefault && (
              <Icon
                small
                material="star"
                tooltip="Is default class for ingresses (when not specified)"
                className={styles.set_default_icon}
              />
            )}
          </div>,
          ingressClass.getController(),
          ingressClass.getNs(),
          ingressClass.getApiGroup(),
          ingressClass.getScope(),
          ingressClass.getKind(),
        ]}
        renderItemMenu={item => (
          // TODO: customize menu + add set-default.injectable.ts item (?)
          <KubeObjectMenu object={item} />
        )}
      />
    </SiblingsInTabLayout>
  );
});

export const IngressClasses = withInjectables<Dependencies>(NonInjectedIngressClasses, {
  getProps: (di, props) => ({
    ...props,
    store: di.inject(ingressClassStoreInjectable),
  }),
});
