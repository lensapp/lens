/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";

export const querySingleElement =
  (attributeName: string, attributeValue: string) =>
    (rendered: RenderResult) => {
      const dataAttribute = `data-${attributeName}-test`;

      return rendered.baseElement.querySelector(
        `[${dataAttribute}="${attributeValue}"]`,
      );
    };

export const queryAllElements =
  (attributeName: string) => (rendered: RenderResult) => {
    const dataAttribute = `data-${attributeName}-test`;

    const results = [...rendered.baseElement.querySelectorAll(`[${dataAttribute}]`)];

    return {
      elements: results,
      attributeValues: results.map(result => result.getAttribute(dataAttribute)),
    };
  };

export const getSingleElement =
  (attributeName: string, attributeValue: string) =>
    (rendered: RenderResult) => {
      const dataAttribute = `data-${attributeName}-test`;

      const element = querySingleElement(attributeName, attributeValue)(rendered);

      if (!element) {
        const validValues = queryAllElements(attributeName)(rendered).attributeValues;

        throw new Error(
          `Couldn't find HTML element with attribute "${dataAttribute}" with value "${attributeValue}". Valid values are:\n\n"${validValues.join(
            '",\n"',
          )}"`,
        );
      }

      return element;
    };
