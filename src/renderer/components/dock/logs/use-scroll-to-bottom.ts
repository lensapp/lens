import { useState } from 'react';

export function useScrollToBottomButton(scrolledParent: HTMLDivElement | null): [isVisible: boolean, setVisibility: () => void] {
  const [isVisible, setToBottomVisible] = useState(false);

  const setVisibility = () => {
    if (!scrolledParent) return;

    const { scrollTop, scrollHeight } = scrolledParent;

    if (scrollHeight - scrollTop > 4000) {
      setToBottomVisible(true);
    } else {
      setToBottomVisible(false);
    }
  }

  return [isVisible, setVisibility];
}