import { getInjectionToken } from "@ogre-tools/injectable";
import type {
  BundledLensExtensionConstructor,
  BundledLensExtensionManifest,
} from "./lens-extension";

export type BundledExtensionResult = BundledLensExtensionConstructor | null;

export interface BundledExtension {
  readonly manifest: BundledLensExtensionManifest;
  main: () => BundledExtensionResult | Promise<BundledExtensionResult>;
  renderer: () => BundledExtensionResult | Promise<BundledExtensionResult>;
}

export const bundledExtensionInjectionToken =
  getInjectionToken<BundledExtension>({
    id: "bundled-extension-path",
  });
