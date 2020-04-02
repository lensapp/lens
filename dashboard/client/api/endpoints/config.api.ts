// App configuration api
import { apiBase } from "../index";
import { IConfig } from "../../../server/common/config";

export const configApi = {
  getConfig() {
    return apiBase.get<IConfig>("/config")
  },
};
