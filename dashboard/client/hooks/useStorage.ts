import { useState } from "react";
import { StorageHelper, StorageHelperOptions } from "../utils";

export function useStorage<T>(key: string, initialValue?: T, options?: StorageHelperOptions): [T, (value: T) => void] {
  const storage = new StorageHelper(key, initialValue, options);
  const [storageValue, setStorageValue] = useState(storage.get());
  const setValue = (value: T): void => {
    setStorageValue(value);
    storage.set(value);
  };
  return [storageValue, setValue];
}