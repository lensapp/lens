import { MutableRefObject, useEffect } from "react";

const config: MutationObserverInit = {
  subtree: true,
  childList: true,
  attributes: false,
  characterData: false
};

export function useMutationObserver(
  ref: MutableRefObject<HTMLElement>,
  callback: MutationCallback,
  options: MutationObserverInit = config
) {
  useEffect(() => {
    if (ref.current) {
      const observer = new MutationObserver(callback);

      observer.observe(ref.current, options);

      return () => {
        observer.disconnect();
      };
    }
  }, [callback, options]);
}
