/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { MatcherFunction, RenderResult, SelectorMatcherOptions, waitForOptions } from "@testing-library/react";
import { getDefaultNormalizer } from "@testing-library/react";

const hasTextFor = (text: string) => {
  const normalize = getDefaultNormalizer();

  return (
    (node: HTMLElement | Element) => normalize(node.textContent ?? "") === text
  );
};

export type FindByTextWithMarkup = (text: string, options?: SelectorMatcherOptions, waitForElementOptions?: waitForOptions) => Promise<void>;

export function findByTextWithMarkupFor(result: RenderResult): FindByTextWithMarkup {
  return async (text, options, waitForOptions) => {
    const hasText = hasTextFor(text);
    const matcherFunction: MatcherFunction = (content, element): boolean => {
      if (!element) {
        return false;
      }

      const childrenDontHaveText = Array.from(element.children)
        .every(child => !hasText(child));

      return hasText(element) && childrenDontHaveText;
    };

    await result.findByText(matcherFunction, options, waitForOptions);
  };
}
