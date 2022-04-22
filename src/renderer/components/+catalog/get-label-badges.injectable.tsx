/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import styles from "./catalog.module.scss";
import React from "react";
import { getInjectable } from "@ogre-tools/injectable";
import type { CatalogEntity } from "../../api/catalog-entity";
import searchUrlPageParamInjectable from "../input/search-url-page-param.injectable";
import { KubeObject } from "../../../common/k8s-api/kube-object";
import { Badge } from "../badge";

export type GetLabelBadges = (entity: CatalogEntity, onClick?: ((evt: React.MouseEvent<any, MouseEvent>) => void) | undefined) => JSX.Element[];

const getLabelBadgesInjectable = getInjectable({
  id: "get-label-badges",
  instantiate: (di): GetLabelBadges => {
    const searchUrlParam = di.inject(searchUrlPageParamInjectable);

    return (entity, onClick) => (
      KubeObject.stringifyLabels(entity.metadata.labels)
        .map(label => (
          <Badge
            scrollable
            className={styles.badge}
            key={label}
            label={label}
            title={label}
            onClick={(event) => {
              searchUrlParam.set(label);
              onClick?.(event);
              event.stopPropagation();
            }}
            expandable={false}
          />
        ))
    );
  },
});

export default getLabelBadgesInjectable;
