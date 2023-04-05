import { getInjectionToken } from "@ogre-tools/injectable";
import type {
  BundledLensExtensionConstructor,
  BundledLensExtensionManifest,
} from "./lens-extension";

export interface BundledExtension {
  readonly manifest: BundledLensExtensionManifest;
  main: () => Promise<BundledLensExtensionConstructor | null>;
  renderer: () => Promise<BundledLensExtensionConstructor | null>;
}

export const bundledExtensionInjectionToken =
  getInjectionToken<BundledExtension>({
    id: "bundled-extension-path",
  });
