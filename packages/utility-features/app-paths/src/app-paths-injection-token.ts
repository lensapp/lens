import { getInjectionToken } from "@ogre-tools/injectable";

export const pathNames = [
  "home",
  "appData",
  "userData",
  "cache",
  "temp",
  "exe",
  "module",
  "desktop",
  "documents",
  "downloads",
  "music",
  "pictures",
  "videos",
  "logs",
  "crashDumps",
  "recent",
] as const;

export type PathName = (typeof pathNames)[number];

export type AppPaths = Record<PathName, string>;

export const appPathsInjectionToken = getInjectionToken<AppPaths>({
  id: "app-paths-token",
});
