/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import styles from "./catalog.module.css";
import React from "react";
import { KubeObject } from "../../../common/k8s-api/kube-object";
import type { CatalogEntity } from "../../api/catalog-entity";
import { Badge } from "../badge";
import { navigation } from "../../navigation";
import { searchUrlParam } from "../input";

/**
 * @param entity The entity to render badge labels for
 */
export function getLabelBadges(entity: CatalogEntity, onClick?: (evt: React.MouseEvent<any, MouseEvent>) => void) {
  return KubeObject.stringifyLabels(entity.metadata.labels)
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
