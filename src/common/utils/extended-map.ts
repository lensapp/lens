import { action, IEnhancer, IObservableMapInitialValues, ObservableMap } from "mobx";

export class ExtendedMap<K, V> extends Map<K, V> {
  constructor(protected getDefault: () => V, entries?: readonly (readonly [K, V])[] | null) {
    super(entries);
  }

  getOrInsert(key: K, val: V): V {
    if (this.has(key)) {
      return this.get(key);
    }

    return this.set(key, val).get(key);
  }

  getOrInsertWith(key: K, getVal: () => V): V {
    if (this.has(key)) {
      return this.get(key);
    }

    return this.set(key, getVal()).get(key);
  }

  getOrDefault(key: K): V {
    if (this.has(key)) {
      return this.get(key);
    }

    return this.set(key, this.getDefault()).get(key);
  }
}

export class ExtendedObservableMap<K, V> extends ObservableMap<K, V> {
  constructor(protected getDefault: () => V, initialData?: IObservableMapInitialValues<K, V>, enhancer?: IEnhancer<V>, name?: string) {
    super(initialData, enhancer, name);
  }

  @action
  getOrInsert(key: K, val: V): V {
    if (this.has(key)) {
      return this.get(key);
    }

    return this.set(key, val).get(key);
  }

  @action
  getOrInsertWith(key: K, getVal: () => V): V {
    if (this.has(key)) {
      return this.get(key);
    }

    return this.set(key, getVal()).get(key);
  }

  @action
  getOrDefault(key: K): V {
    if (this.has(key)) {
      return this.get(key);
    }

    return this.set(key, this.getDefault()).get(key);
  }
}
