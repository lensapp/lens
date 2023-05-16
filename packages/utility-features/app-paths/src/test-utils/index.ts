import type { DiContainer } from "@ogre-tools/injectable";
import joinPathsInjectable from "../join-paths/join-paths.injectable";
import path from "path";
import { getInjectable } from "@ogre-tools/injectable";
import { appPathsInjectionToken } from "../app-paths-injection-token";

const doGlobalOverrides = (di: DiContainer) => {
  // Note: implementation of app-paths is still in OpenLens.
  // Therefore, a stub is registered in its place to serve spirit of unit testing.
  const appPathsStubInjectable = getInjectable({
    id: "app-paths-stub",

    instantiate: () => ({
      appData: "some-app-data-directory",
      cache: "some-cache-directory",
      crashDumps: "some-crash-dumps-directory",
      desktop: "some-desktop-directory",
      documents: "some-documents-directory",
      downloads: "some-downloads-directory",
      exe: "some-exe-directory",
      home: "some-home-directory",
      logs: "some-logs-directory",
      module: "some-module-directory",
      music: "some-music-directory",
      pictures: "some-pictures-directory",
      recent: "some-recent-directory",
      temp: "some-temp-directory",
      videos: "some-videos-directory",
      userData: "some-user-data-directory",
    }),

    injectionToken: appPathsInjectionToken,
  });

  di.register(appPathsStubInjectable);

  di.override(joinPathsInjectable, () => path.posix.join);
};

export const testUtils = { doGlobalOverrides };
