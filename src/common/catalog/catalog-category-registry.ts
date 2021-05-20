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

import { action, computed } from "mobx";
import type { CatalogEntity } from "../../main/catalog";
import { Disposer, disposer, ExtendedObservableMap, iter, Singleton } from "../utils";
import { CatalogCategoryRegistration as CommonCatalogCategoryRegistration, CatalogCategorySpecVersion, CategoryMetadata, parseApiVersion, WithId } from "./catalog-entity";
import util from "util";
import { once } from "lodash";

const validApiVersions = new Map<string, Set<string>>(
  [
    ["catalog.k8slens.dev", new Set("v1alpha1")]
  ],
);

function getValidityList(items: Iterable<string>): string {
  let res = "";

  for (const item of items) {
    if (res.length) {
      res += ", ";
    }

    res += item;
  }

  return res;
}

const validGroupList = getValidityList(validApiVersions.keys());

function validateCatalogCategoryRegistration<CatalogCategoryRegistration extends CommonCatalogCategoryRegistration<CategoryMetadata, CatalogCategorySpecVersion>>(reg: CatalogCategoryRegistration): void {
  const { group, version } = parseApiVersion(reg.apiVersion);
  const validVersions = validApiVersions.get(group);
  const fGroup = util.inspect(group, false, null, false);
  const fVersion = util.inspect(version, false, null, false);

  if (!validVersions) {
    throw new TypeError(`Invalid group: ${fGroup}. Valid groups are: ${validGroupList}`);
  }

  if (!validVersions.has(version)) {
    throw new TypeError(`Unsupported version: ${fVersion} for ${fGroup}. Valid versions are: ${getValidityList(validVersions)}`);
  }
}

export abstract class CatalogCategoryRegistry<
  Registration extends CommonCatalogCategoryRegistration<CategoryMetadata, CatalogCategorySpecVersion>,
  Registered extends Registration,
> extends Singleton {
  /**
     * This is a mapping based on the versions of Categories, see `./catalog-entity` for the validation
     */
  protected groupVersionKinds = new ExtendedObservableMap<string, ExtendedObservableMap<string, ExtendedObservableMap<string, Registered & WithId>>>();

  protected abstract register(registration: Registration): Registered;

  @action add(registration: Registration): Disposer {
    validateCatalogCategoryRegistration(registration);

    return this.updateGroupKinds(this.register(registration));
  }

  private updateGroupKinds(category: Registered): Disposer {
    const { group, versions, names: { kind } } = category.spec;
    const groups = this.groupVersionKinds.getOrInsert(group, ExtendedObservableMap.new);
    const cleanup = disposer();

    for (const { version } of versions) {
      const versioning = groups.getOrInsert(version, ExtendedObservableMap.new);

      versioning.strictSet(kind, { ...category, id: `${group}/${kind}` });
      cleanup.push(once(() => versioning.delete(kind)));
    }

    return cleanup;
  }

  @computed get items() {
    return Array.from(iter.flatMap(this.groupVersionKinds.values(), groups => iter.flatMap(groups.values(), kinds => kinds.values())));
  }

  getForGroupKind(group: string, version: string, kind: string): Registration | undefined {
    return this.groupVersionKinds.get(group)?.get(version)?.get(kind);
  }

  protected getRegistered(apiVersion: string, kind: string) {
    const { group, version } = parseApiVersion(apiVersion);

    return this.groupVersionKinds.get(group)?.get(version)?.get(kind);
  }

  hasForGroupKind(group: string, version: string, kind: string): boolean {
    return Boolean(this.getForGroupKind(group, version, kind));
  }

  getCategoryForEntity(data: CatalogEntity): Registration | undefined {
    const { group, version } = parseApiVersion(data.apiVersion);

    return this.getForGroupKind(group, version, data.kind);
  }
}
