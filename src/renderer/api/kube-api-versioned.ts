import { stringify } from "querystring";
import { KubeObject } from "./kube-object";
import { createKubeApiURL } from "./kube-api-parse";
import { KubeApi, IKubeApiQueryParams, IKubeApiOptions } from "./kube-api";
import { apiManager } from "./api-manager";

export class VersionedKubeApi<T extends KubeObject = any> extends KubeApi<T> {
  private preferredVersion?: string;

  constructor(opts: IKubeApiOptions<T>) {
    super(opts);

    this.getPreferredVersion().then(() => {
      if (this.apiBase != opts.apiBase)
        apiManager.registerApi(this.apiBase, this);
    });
  }

  // override this property to make read-write
  apiBase: string

  async getPreferredVersion() {
    if (this.preferredVersion) return;

    const apiGroupVersion = await this.request.get<{ preferredVersion?: { version: string; }; }>(`${this.apiPrefix}/${this.apiGroup}`);
    
    if (!apiGroupVersion?.preferredVersion) return;

    this.preferredVersion = apiGroupVersion.preferredVersion.version;

    // update apiBase
    this.apiBase = this.getUrl();
  }

  async list({ namespace = "" } = {}, query?: IKubeApiQueryParams): Promise<T[]> {
    await this.getPreferredVersion();
    return await super.list({namespace}, query);
  }
  async get({ name = "", namespace = "default" } = {}, query?: IKubeApiQueryParams): Promise<T> {
    await this.getPreferredVersion();
    return super.get({ name, namespace }, query);
  }

  getUrl({ name = "", namespace = "" } = {}, query?: Partial<IKubeApiQueryParams>) {
    const { apiPrefix, apiGroup, apiVersion, apiResource, preferredVersion, isNamespaced } = this;

    const resourcePath = createKubeApiURL({
      apiPrefix: apiPrefix,
      apiVersion: `${apiGroup}/${preferredVersion ?? apiVersion}`,
      resource: apiResource,
      namespace: isNamespaced ? namespace : undefined,
      name: name,
    });
    return resourcePath + (query ? `?` + stringify(this.normalizeQuery(query)) : "");
  }
}
