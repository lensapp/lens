// App configuration api
import { apiBase } from "../index";
import { IConfig } from "../../../server/common/config";
import { CancelablePromise } from "client/utils/cancelableFetch";

export const configApi = {
  getConfig(): CancelablePromise<IConfig> {
    return apiBase.get<IConfig>("/config");
  },
};
