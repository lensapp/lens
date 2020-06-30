// App configuration api
import type { IConfigRoutePayload } from "../../../main/routes/config";
import { apiBase } from "../index";

export const configApi = {
  getConfig() {
    return apiBase.get<IConfigRoutePayload>("/config")
  },
};
