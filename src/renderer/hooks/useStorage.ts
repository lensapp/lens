import { useState } from "react";
import { createStorage } from "../utils";

export function useStorage<T>(key: string, initialValue: T) {
  const storage = createStorage(key, initialValue);
  const [storageValue, setStorageValue] = useState(storage.get());
  const setValue = (value: T) => {
    setStorageValue(value);
    storage.set(value);
  };

  return [storageValue, setValue] as [T, (value: T) => void];
}
