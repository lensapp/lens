/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import styles from "./catalog.module.scss";
import React from "react";
import { computed } from "mobx";
import type { ItemObject } from "../../../common/item.store";
import { Badge } from "../badge";
import { navigation } from "../../navigation";
import { searchUrlParam } from "../input";
import { KubeObject } from "../../../common/k8s-api/kube-object";
import type { CatalogEntityRegistry } from "../../catalog/entity-registry";
import { CatalogEntity } from "../../../common/catalog";

export class CatalogEntityItem<T extends CatalogEntity> implements ItemObject {
  constructor(public entity: T, private registry: CatalogEntityRegistry) {
    if (!(entity instanceof CatalogEntity)) {
      throw Object.assign(new TypeError("CatalogEntityItem cannot wrap a non-CatalogEntity type"), { typeof: typeof entity, prototype: Object.getPrototypeOf(entity) });
    }
  }

  get kind() {
    return this.entity.kind;
  }

  get apiVersion() {
    return this.entity.apiVersion;
  }

  get name() {
    return this.entity.metadata.name;
  }

  getName() {
    return this.entity.metadata.name;
  }

  get id() {
    return this.entity.metadata.uid;
  }

  getId() {
    return this.id;
  }

  @computed get phase() {
    return this.entity.status.phase;
  }

  get enabled() {
    return this.entity.status.enabled ?? true;
  }

  get labels() {
    return KubeObject.stringifyLabels(this.entity.metadata.labels);
  }

  getLabelBadges(onClick?: React.MouseEventHandler<any>) {
    return this.labels
      .map(label => (
        <Badge
          scrollable
          className={styles.badge}
          key={label}
          label={label}
          title={label}
          onClick={(event) => {
            navigation.searchParams.set(searchUrlParam.name, label);
            onClick?.(event);
            event.stopPropagation();
          }}
          expandable={false}
        />
      ));
  }

  get source() {
    return this.entity.metadata.source || "unknown";
  }

  get searchFields() {
    return [
      this.name,
      this.id,
      this.phase,
      `source=${this.source}`,
      ...this.labels,
    ];
  }

  onRun() {
    this.registry.onRun(this.entity);
  }
}
