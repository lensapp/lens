import type { ResolvePath } from "./lens-link";

export type GetLensLinkDirectory = (moduleName: string) => string;

export const getLensLinkDirectoryFor =
  (workingDirectory: string, resolvePath: ResolvePath): GetLensLinkDirectory =>
  (moduleName) =>
    resolvePath(workingDirectory, "node_modules", moduleName);
