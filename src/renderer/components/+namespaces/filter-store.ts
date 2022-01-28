/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, comparer, computed, IComputedValue, IReactionDisposer, reaction } from "mobx";
import { StorageLayer, ToggleSet } from "../../utils";

export interface NamespaceSelectFilterManagerDependencies {
  storage: StorageLayer<string[] | undefined>;
  namespaces: IComputedValue<string[]>;
  accessibleNamespaces: IComputedValue<string[]>;
}

export class NamespaceSelectFilterManager {
  constructor(protected readonly dependencies: NamespaceSelectFilterManagerDependencies) {
    this.selectNamespaces(this.initialNamespaces);
  }

  public onContextChange(callback: (namespaces: string[]) => void, opts: { fireImmediately?: boolean } = {}): IReactionDisposer {
    return reaction(() => Array.from(this.contextNamespaces), callback, {
      fireImmediately: opts.fireImmediately,
      equals: comparer.shallow,
    });
  }

  private get initialNamespaces(): string[] {
    const { allowedNamespaces } = this;
    const selectedNamespaces = this.dependencies.storage.get(); // raw namespaces, undefined on first load

    // return previously saved namespaces from local-storage (if any)
    if (Array.isArray(selectedNamespaces)) {
      return selectedNamespaces.filter(namespace => allowedNamespaces.includes(namespace));
    }

    // otherwise select "default" or first allowed namespace
    if (allowedNamespaces.includes("default")) {
      return ["default"];
    } else if (allowedNamespaces.length) {
      return [allowedNamespaces[0]];
    }

    return [];
  }

  /**
   * @private
   * The current value (list of namespaces names) in the storage layer
   */
  @computed private get selectedNamespaces(): string[] {
    return this.dependencies.storage.get() ?? [];
  }

  @computed get allowedNamespaces(): string[] {
    const accessibleNamespaces = this.dependencies.accessibleNamespaces.get();

    if (accessibleNamespaces.length > 0) {
      return accessibleNamespaces;
    }

    return this.dependencies.namespaces.get();
  }

  /**
   * The list of selected namespace names (for filtering)
   */
  @computed get contextNamespaces(): string[] {
    if (!this.selectedNamespaces.length) {
      return this.allowedNamespaces; // show all namespaces when nothing selected
    }

    return this.selectedNamespaces;
  }

  /**
   * The set of select namespace names (for filtering)
   */
  @computed get selectedNames(): Set<string> {
    return new Set(this.contextNamespaces);
  }

  /**
   * Is true when the the set of namespace names selected is implicitly all
   *
   * Namely, this will be true if the user has deselected all namespaces from
   * the filter or if the user has clicked the "All Namespaces" option
   */
  @computed get areAllSelectedImplicitly(): boolean {
    return this.selectedNamespaces.length === 0;
  }

  @action
  selectNamespaces(namespace: string | string[]) {
    const namespaces = Array.from(new Set([namespace].flat()));

    this.dependencies.storage.set(namespaces);
  }

  @action
  clearSelected(namespaces?: string | string[]) {
    if (namespaces) {
      const resettingNamespaces = [namespaces].flat();
      const newNamespaces = this.dependencies.storage.get().filter(ns => !resettingNamespaces.includes(ns));

      this.dependencies.storage.set(newNamespaces);
    } else {
      this.dependencies.storage.reset();
    }
  }

  /**
   * Checks if namespace names are selected for filtering
   * @param namespaces One or several names of namespaces to check if they are selected
   * @returns `true` if all the provided names are selected
   */
  hasContext(namespaces: string | string[]): boolean {
    return [namespaces]
      .flat()
      .every(namespace => this.selectedNames.has(namespace));
  }

  /**
   * Is `true` if all available namespaces are selected, otherwise `false`
   */
  @computed get hasAllContexts(): boolean {
    return this.contextNamespaces.length === this.allowedNamespaces.length;
  }

  /**
   * Acts like `toggleSingle` but can work on several at a time
   * @param namespaces One or many names of namespaces to select
   */
  @action
  toggleContext(namespaces: string | string[]) {
    const nextState = new ToggleSet(this.contextNamespaces);

    for (const namespace of [namespaces].flat()) {
      nextState.toggle(namespace);
    }

    this.dependencies.storage.set([...nextState]);
  }

  /**
   * Toggles the selection state of `namespace`. Namely, if it was previously
   * specifically or implicitly selected then after this call it will be
   * explicitly deselected.
   * @param namespace The name of a namespace
   */
  toggleSingle(namespace: string) {
    const nextState = new ToggleSet(this.contextNamespaces);

    nextState.toggle(namespace);
    this.dependencies.storage.set([...nextState]);
  }

  /**
   * Makes the given namespace the sole selected namespace
   */
  selectSingle(namespace: string) {
    this.dependencies.storage.set([namespace]);
  }

  /**
   * Selects all available namespaces.
   *
   * Note: If new namespaces appear in the future those will be selected too
   */
  selectAll() {
    this.selectNamespaces([]);
  }

  /**
   * This function selects all namespaces implicitly.
   *
   * NOTE: does not toggle any namespaces
   * @param selectAll NOT USED
   * @deprecated Use `NamespaceStore.selectAll` instead.
   */
  toggleAll(selectAll?: boolean) {
    void selectAll;
    this.selectAll();
  }
}
