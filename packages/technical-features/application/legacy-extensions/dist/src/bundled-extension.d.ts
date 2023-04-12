import type { LensExtensionConstructor, LensExtensionManifest } from "./lens-extension";
export interface BundledExtension {
    readonly manifest: LensExtensionManifest;
    main: () => LensExtensionConstructor | null;
    renderer: () => LensExtensionConstructor | null;
}
export declare const bundledExtensionInjectionToken: import("@ogre-tools/injectable").InjectionToken<BundledExtension, void>;
