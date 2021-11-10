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

import isEqual from "lodash/isEqual";
import { action, observable, reaction, when, makeObservable } from "mobx";
import { autoBind } from "../../utils";
import { createRelease, deleteRelease, HelmRelease, IReleaseCreatePayload, IReleaseUpdatePayload, listReleases, rollbackRelease, updateRelease } from "../../../common/k8s-api/endpoints/helm-releases.api";
import { ItemStore } from "../../../common/item.store";
import type { Secret } from "../../../common/k8s-api/endpoints";
import { secretsStore } from "../+config-secrets/secrets.store";
import { namespaceStore } from "../+namespaces/namespace.store";
import { Notifications } from "../notifications";
import logger from "../../../common/logger";

export class ReleaseStore extends ItemStore<HelmRelease> {
  releaseSecrets = observable.map<string, Secret>();

  constructor() {
    super();
    makeObservable(this);
    autoBind(this);

    when(() => secretsStore.isLoaded, () => {
      this.releaseSecrets.replace(this.getReleaseSecrets());
    });
  }

  watchAssociatedSecrets(): (() => void) {
    return reaction(() => secretsStore.getItems(), () => {
      if (this.isLoading) return;
      const newSecrets = this.getReleaseSecrets();
      const amountChanged = newSecrets.length !== this.releaseSecrets.size;
      const labelsChanged = newSecrets.some(([id, secret]) => (
        !isEqual(secret.getLabels(), this.releaseSecrets.get(id)?.getLabels())
      ));

      if (amountChanged || labelsChanged) {
        this.loadFromContextNamespaces();
      }
      this.releaseSecrets.replace(newSecrets);
    }, {
      fireImmediately: true,
    });
  }

  watchSelectedNamespaces(): (() => void) {
    return reaction(() => namespaceStore.context.contextNamespaces, namespaces => {
      this.loadAll(namespaces);
    }, {
      fireImmediately: true,
    });
  }

  private getReleaseSecrets() {
    return secretsStore
      .getByLabel({ owner: "helm" })
      .map(s => [s.getId(), s] as const);
  }

  getReleaseSecret(release: HelmRelease) {
    return secretsStore.getByLabel({
      owner: "helm",
      name: release.getName(),
    })
      .find(secret => secret.getNs() == release.getNs());
  }

  @action
  async loadAll(namespaces: string[]) {
    this.isLoading = true;
    this.isLoaded = false;

    try {
      const items = await this.loadItems(namespaces);

      this.items.replace(this.sortItems(items));
      this.isLoaded = true;
      this.failedLoading = false;
    } catch (error) {
      this.failedLoading = true;
      logger.warn("Loading Helm Chart releases has failed", error);

      if (error.error) {
        Notifications.error(error.error);
      }
    } finally {
      this.isLoading = false;
    }
  }

  async loadFromContextNamespaces(): Promise<void> {
    return this.loadAll(namespaceStore.context.contextNamespaces);
  }

  async loadItems(namespaces: string[]) {
    const isLoadingAll = namespaceStore.context.allNamespaces?.length > 1
      && namespaceStore.context.cluster.accessibleNamespaces.length === 0
      && namespaceStore.context.allNamespaces.every(ns => namespaces.includes(ns));

    if (isLoadingAll) {
      return listReleases();
    }

    return Promise // load resources per namespace
      .all(namespaces.map(namespace => listReleases(namespace)))
      .then(items => items.flat());
  }

  async create(payload: IReleaseCreatePayload) {
    const response = await createRelease(payload);

    if (this.isLoaded) this.loadFromContextNamespaces();

    return response;
  }

  async update(name: string, namespace: string, payload: IReleaseUpdatePayload) {
    const response = await updateRelease(name, namespace, payload);

    if (this.isLoaded) this.loadFromContextNamespaces();

    return response;
  }

  async rollback(name: string, namespace: string, revision: number) {
    const response = await rollbackRelease(name, namespace, revision);

    if (this.isLoaded) this.loadFromContextNamespaces();

    return response;
  }

  async remove(release: HelmRelease) {
    return super.removeItem(release, () => deleteRelease(release.getName(), release.getNs()));
  }

  async removeSelectedItems() {
    return Promise.all(this.selectedItems.map(this.remove));
  }
}

export const releaseStore = new ReleaseStore();
