/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./namespace-select-badge.module.scss";
import React from "react";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { BadgeProps } from "../badge";
import { Badge } from "../badge";
import type {
  FilterByNamespace,
} from "./namespace-select-filter-model/filter-by-namespace.injectable";
import filterByNamespaceInjectable
  from "./namespace-select-filter-model/filter-by-namespace.injectable";
import { prevDefault, cssNames } from "@k8slens/utilities";

export interface NamespaceSelectBadgeProps extends BadgeProps {
  namespace: string;
}

export interface Dependencies {
  filterByNamespace: FilterByNamespace;
}

export function NamespaceSelectBadgeNonInjected(
  {
    namespace,
    label,
    filterByNamespace,
    ...props
  }: NamespaceSelectBadgeProps & Dependencies) {
  return (
    <Badge
      flat={true}
      expandable={false}
      {...props}
      label={namespace ?? label}
      tooltip={(
        <>
          Set global namespace filter to:
          <b>{namespace}</b>
        </>
      )}
      className={cssNames(styles.NamespaceSelectBadge, props.className)}
      onClick={prevDefault(() => filterByNamespace(namespace))}
    />
  );
}

export const NamespaceSelectBadge = withInjectables<Dependencies, NamespaceSelectBadgeProps>(NamespaceSelectBadgeNonInjected, {
  getProps(di, props) {
    return {
      ...props,
      filterByNamespace: di.inject(filterByNamespaceInjectable),
    };
  },
});
