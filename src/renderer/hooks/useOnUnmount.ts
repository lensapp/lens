import { useEffect } from "react";

export function useOnUnmount(callback: () => void) {
  useEffect(() => callback, [])
}