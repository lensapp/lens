import { useState } from "react";
import { createStorage, IStorageHelperOptions } from "../utils";

export function useStorage<T>(key: string, initialValue?: T, options?: IStorageHelperOptions) {
  const storage = createStorage(key, initialValue, options);
  const [storageValue, setStorageValue] = useState(storage.get());
  const setValue = (value: T) => {
    setStorageValue(value);
    storage.set(value);
  };
  return [storageValue, setValue] as [T, (value: T) => void];
}