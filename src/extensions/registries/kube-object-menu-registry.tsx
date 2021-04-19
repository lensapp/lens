import { IObservableArray, observable } from "mobx";
import { IKubeObjectConstructor } from "../../renderer/api/kube-object";
import { finalizeEntry, RawRootMenuEntry, RootMenuEntry, safeWhen } from "../../renderer/descriptors/menu-entry";
import { extensionLoader } from "../extension-loader";
import { LensRendererExtension, registeredKubeObjectMenuItems } from "../lens-renderer-extension";
import { KubeObject } from "../renderer-api/k8s-api";

export type KubeObjectMenuRegistration = RawRootMenuEntry<KubeObject> & {
  kind: string;
  apiVersions: string[];
  when?: (object: KubeObject) => any,
};

export type LensKubeObjectMenuRegistration<KO extends KubeObject> = RawRootMenuEntry<KO> & {
  Object: IKubeObjectConstructor<KO>;
  apiVersions?: string[];
  when?: (object: KO) => any,
};

export interface RegisteredKubeObjectMenuItem extends KubeObjectMenuItemEntry<KubeObject> {
  kind: string;
}

export interface LensRegisteredKubeObjectMenuItem<KO extends KubeObject> extends KubeObjectMenuItemEntry<KO> {
  Object: IKubeObjectConstructor<KO>;
}

/**
 * Used by a map, in a computed getter in `LensRendererExtension`
 * @param registration An Extension's KubeObjectMenuItem registration descriptor
 * @returns A split out descriptor
 */
export function getRegisteredKubeObjectMenuItems({ apiVersions, kind, when, ...menuItem }: KubeObjectMenuRegistration): RegisteredKubeObjectMenuItem {
  return {
    apiVersions: new Set(apiVersions),
    kind,
    when: safeWhen(when),
    menuItem,
  };
}

export function lensGetRegisteredKubeObjectMenuItems<KO extends KubeObject>({ apiVersions, Object, when, ...menuItem }: LensKubeObjectMenuRegistration<KO>): LensRegisteredKubeObjectMenuItem<KO> {
  return {
    apiVersions: apiVersions ? new Set(apiVersions) : null,
    Object,
    menuItem,
    when,
  };
}

interface KubeObjectMenuItemEntry<KO extends KubeObject> {
  apiVersions: Set<string> | null;
  menuItem: RawRootMenuEntry<KO>,
  when: (object: KO) => any,
}
const specificKubeObjectMenuItems = observable.map<string, IObservableArray<KubeObjectMenuItemEntry<KubeObject>>>();

/**
 * Get all the registered `MenuItem` descriptors give the object's `kind`, `apiVersion`,
 * and if it passes the filtering in the descriptor.
 * @param object The KubeObject instance to get `MenuItem` descriptors for
 * @returns The list of registered `MenuItem` descriptors. With all the
 * extensions first and Lens entries last.
 */
export function getKubeObjectMenuItems<KO extends KubeObject>(object?: KO): RootMenuEntry[] {
  if (!object) {
    return [];
  }

  const extensions = extensionLoader.allEnabledInstances as LensRendererExtension[];
  const lensMenuItems = specificKubeObjectMenuItems
    .get(object.kind)
    ?.filter(({ apiVersions, when }) => (
      (apiVersions === null
      || apiVersions.has(object.apiVersion))
      && when(object)
    ))
    .map(({ menuItem }) => finalizeEntry(object, menuItem));
  const extensionsMenuItems = extensions
    .flatMap(ext => ext[registeredKubeObjectMenuItems])
    .filter(({ kind, apiVersions, when }) => (
      kind === object.kind
      && apiVersions.has(object.apiVersion)
      && when(object)
    ))
    .map(({ menuItem }) => finalizeEntry(object, menuItem));

  return [...extensionsMenuItems, ...lensMenuItems];
}

/**
 * Add a KubeObjectMenuItem to the Lens specific collection
 * @param src The arguments of the menu item registration
 */
export function addLensKubeObjectMenuItem<KO extends KubeObject>(src: LensKubeObjectMenuRegistration<KO>): void {
  const { Object, apiVersions, when, menuItem } = lensGetRegisteredKubeObjectMenuItems(src);
  const items = specificKubeObjectMenuItems.get(Object.kind);
  const pair: KubeObjectMenuItemEntry<KubeObject> = {
    apiVersions,
    menuItem: menuItem as any,
    when: safeWhen(when),
  };

  if (!items) {
    specificKubeObjectMenuItems.set(Object.kind, observable.array([pair]));
  } else {
    items.push(pair);
  }
}

/**
 * Add a KubeObjectMenuItem to the Lens specific collection where a class extending KubeObject
 * does not exist. For instance CRD instances.
 * @param src The arguments of the menu item registration
 */
export function addLensKubeObjectMenuItemRaw(src: KubeObjectMenuRegistration): void {
  const { kind, apiVersions, when, menuItem } = getRegisteredKubeObjectMenuItems(src);
  const items = specificKubeObjectMenuItems.get(kind);
  const pair = {
    apiVersions,
    menuItem,
    when: safeWhen(when),
  };

  if (!items) {
    specificKubeObjectMenuItems.set(kind, observable.array([pair]));
  } else {
    items.push(pair);
  }
}
