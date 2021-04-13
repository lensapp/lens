import type { RouteProps } from "react-router";
import { commandRegistry } from "../../../extensions/registries/command-registry";
import { buildURL } from "../../../common/utils/buildUrl";
import { navigate } from "../../navigation";

export const preferencesRoute: RouteProps = {
  path: "/preferences"
};

export const preferencesURL = buildURL(preferencesRoute.path);

commandRegistry.add({
  id: "app.showPreferences",
  title: "Preferences: Open",
  scope: "global",
  action: () => navigate(preferencesURL())
});
