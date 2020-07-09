import isEqual from "lodash/isEqual";
import { action, observable, when, IReactionDisposer, reaction } from "mobx";
import { autobind } from "../../utils";
import { HelmRelease, helmReleasesApi, ReleaseCreatePayload, ReleaseUpdatePayload, ReleaseUpdateDetails } from "../../api/endpoints/helm-releases.api";
import { ItemStore } from "../../item.store";
import { configStore } from "../../config.store";
import { secretsStore } from "../+config-secrets/secrets.store";
import { Secret } from "../../api/endpoints";
import { KubeJsonApiData } from "client/api/kube-json-api";

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

  watch(): void {
    this.secretWatcher = reaction(() => secretsStore.items.toJS(), () => {
      if (this.isLoading) {
        return;
      }
      const secrets = this.getReleaseSecrets();
      const amountChanged = secrets.length !== this.releaseSecrets.length;
      const labelsChanged = this.releaseSecrets.some(item => {
        const secret = secrets.find(secret => secret.getId() == item.getId());
        if (!secret) {
          return;
        }
        return !isEqual(item.getLabels(), secret.getLabels());
      });
      if (amountChanged || labelsChanged) {
        this.loadAll();
      }
      this.releaseSecrets = [...secrets];
    });
  }

  unwatch(): void {
    this.secretWatcher();
  }

  getReleaseSecrets(): Secret[] {
    return secretsStore.getByLabel({ owner: "helm" });
  }

  getReleaseSecret(release: HelmRelease): Secret {
    const labels = {
      owner: "helm",
      name: release.getName()
    };
    return secretsStore.getByLabel(labels)
      .filter(secret => secret.getNs() == release.namespace)[0];
  }

  @action
  async loadAll(): Promise<void> {
    this.isLoading = true;
    let items: HelmRelease[];
    try {
      const { isClusterAdmin, allowedNamespaces } = configStore;
      items = await this.loadItems(...(!isClusterAdmin ? allowedNamespaces : []));
    } finally {
      if (items) {
        items = this.sortItems(items);
        this.items.replace(items);
      }
      this.isLoaded = true;
      this.isLoading = false;
    }
  }

  async loadItems(...namespaces: any[]): Promise<HelmRelease[]> {
    if (!namespaces) {
      return helmReleasesApi.list();
    } else {
      return Promise
        .all(namespaces.map(namespace => helmReleasesApi.list(namespace)))
        .then(items => items.flat());
    }
  }

  async create(payload: ReleaseCreatePayload): Promise<ReleaseUpdateDetails> {
    const response = await helmReleasesApi.create(payload);
    if (this.isLoaded) {
      this.loadAll();
    }
    return response;
  }

  async update(name: string, namespace: string, payload: ReleaseUpdatePayload): Promise<ReleaseUpdateDetails> {
    const response = await helmReleasesApi.update(name, namespace, payload);
    if (this.isLoaded) {
      this.loadAll();
    }
    return response;
  }

  async rollback(name: string, namespace: string, revision: number): Promise<KubeJsonApiData> {
    const response = await helmReleasesApi.rollback(name, namespace, revision);
    if (this.isLoaded) {
      this.loadAll();
    }
    return response;
  }

  async remove(release: HelmRelease): Promise<void> {
    return super.removeItem(release, () => helmReleasesApi.delete(release.getName(), release.namespace));
  }

  async removeSelectedItems(): Promise<void> {
    if (!this.selectedItems.length) {
      return;
    }
    await Promise.all(this.selectedItems.map(this.remove));
  }
}

export const releaseStore = new ReleaseStore();
