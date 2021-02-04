import isEqual from "lodash/isEqual";
import { action, IReactionDisposer, observable, reaction, when } from "mobx";
import { autobind } from "../../utils";
import { HelmRelease, helmReleasesApi, IReleaseCreatePayload, IReleaseUpdatePayload } from "../../api/endpoints/helm-releases.api";
import { ItemStore } from "../../item.store";
import { Secret } from "../../api/endpoints";
import { secretsStore } from "../+config-secrets/secrets.store";
import { namespaceStore } from "../+namespaces/namespace.store";

@autobind()
export class ReleaseStore extends ItemStore<HelmRelease> {
  @observable releaseSecrets: Secret[] = [];
  @observable secretWatcher: IReactionDisposer;

  constructor() {
    super();
    when(() => secretsStore.isLoaded, () => {
      this.releaseSecrets = this.getReleaseSecrets();
    });
  }

  watch() {
    this.secretWatcher = reaction(() => secretsStore.items.toJS(), () => {
      if (this.isLoading) return;
      const secrets = this.getReleaseSecrets();
      const amountChanged = secrets.length !== this.releaseSecrets.length;
      const labelsChanged = this.releaseSecrets.some(item => {
        const secret = secrets.find(secret => secret.getId() == item.getId());

        if (!secret) return;

        return !isEqual(item.getLabels(), secret.getLabels());
      });

      if (amountChanged || labelsChanged) {
        this.loadAll();
      }
      this.releaseSecrets = [...secrets];
    });
  }

  unwatch() {
    this.secretWatcher();
  }

  getReleaseSecrets() {
    return secretsStore.getByLabel({ owner: "helm" });
  }

  getReleaseSecret(release: HelmRelease) {
    const labels = {
      owner: "helm",
      name: release.getName()
    };

    return secretsStore.getByLabel(labels)
      .filter(secret => secret.getNs() == release.getNs())[0];
  }

  @action
  async loadAll(namespaces = namespaceStore.allowedNamespaces) {
    this.isLoading = true;

    try {
      const items = await this.loadItems(namespaces);

      this.items.replace(this.sortItems(items));
      this.isLoaded = true;
    } catch (error) {
      console.error(`Loading Helm Chart releases has failed: ${error}`);
    } finally {
      this.isLoading = false;
    }
  }

  async loadSelectedNamespaces(): Promise<void> {
    return this.loadAll(namespaceStore.getContextNamespaces());
  }

  async loadItems(namespaces: string[]) {
    return Promise
      .all(namespaces.map(namespace => helmReleasesApi.list(namespace)))
      .then(items => items.flat());
  }

  async create(payload: IReleaseCreatePayload) {
    const response = await helmReleasesApi.create(payload);

    if (this.isLoaded) this.loadSelectedNamespaces();

    return response;
  }

  async update(name: string, namespace: string, payload: IReleaseUpdatePayload) {
    const response = await helmReleasesApi.update(name, namespace, payload);

    if (this.isLoaded) this.loadSelectedNamespaces();

    return response;
  }

  async rollback(name: string, namespace: string, revision: number) {
    const response = await helmReleasesApi.rollback(name, namespace, revision);

    if (this.isLoaded) this.loadSelectedNamespaces();

    return response;
  }

  async remove(release: HelmRelease) {
    return super.removeItem(release, () => helmReleasesApi.delete(release.getName(), release.getNs()));
  }

  async removeSelectedItems() {
    if (!this.selectedItems.length) return;

    return Promise.all(this.selectedItems.map(this.remove));
  }
}

export const releaseStore = new ReleaseStore();
