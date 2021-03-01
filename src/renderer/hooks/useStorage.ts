import { useState } from "react";
import { createStorage, StorageHelperOptions } from "../local-storage";

export function useStorage<T>(key: string, initialValue?: T, options?: StorageHelperOptions) {
  const storage = createStorage(key, initialValue, options);
  const [storageValue, setStorageValue] = useState(storage.get());
  const setValue = (value: T) => {
    setStorageValue(value);
    storage.set(value);
  };

  return [storageValue, setValue] as [T, (value: T) => void];
}
