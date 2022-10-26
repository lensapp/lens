/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";

type DiscoverySourceTypes = RenderResult | Element;

export type QuerySingleElement = (
  attributeName: string,
  attributeValue?: string
) => { discovered: Element | null } & Discover;

export type GetSingleElement = (
  attributeName: string,
  attributeValue?: string
) => { discovered: Element } & Discover;

export type QueryAllElements = (attributeName: string) => {
  discovered: Element[];
  attributeValues: (string | null)[];
};

export interface Discover {
  querySingleElement: QuerySingleElement;
  queryAllElements: QueryAllElements;
  getSingleElement: GetSingleElement;
}

export const discoverFor = (getSource: () => DiscoverySourceTypes): Discover => ({
  querySingleElement: querySingleElement(getSource),
  queryAllElements: queryAllElements(getSource),
  getSingleElement: getSingleElement(getSource),
});

export const querySingleElement =
  (getSource: () => DiscoverySourceTypes): QuerySingleElement =>
    (attributeName, attributeValue) => {
      const source = getSource();

      const dataAttribute = `data-${attributeName}-test`;

      const selector = attributeValue
        ? `[${dataAttribute}="${attributeValue}"]`
        : `[${dataAttribute}]`;

      const discovered = getBaseElement(source).querySelector(selector);

      const nestedDiscover = discoverFor(() => {
        if (!discovered) {
          throw new Error("Tried to do nested discover using source that does not exist");
        }

        return discovered;
      });

      return {
        discovered,

        ...nestedDiscover,
      };
    };

export const queryAllElements =
  (getSource: () => DiscoverySourceTypes): QueryAllElements =>
    (attributeName) => {
      const source = getSource();

      const dataAttribute = `data-${attributeName}-test`;

      const results = [
        ...getBaseElement(source).querySelectorAll(`[${dataAttribute}]`),
      ];

      return {
        discovered: results,

        attributeValues: results.map((result) =>
          result.getAttribute(dataAttribute),
        ),
      };
    };

export const getSingleElement =
  (getSource: () => DiscoverySourceTypes): GetSingleElement =>
    (attributeName, attributeValue) => {
      const dataAttribute = `data-${attributeName}-test`;

      const { discovered, ...nestedDiscover } = querySingleElement(getSource)(
        attributeName,
        attributeValue,
      );

      if (!discovered) {
        const validValues =
        queryAllElements(getSource)(attributeName).attributeValues;

        if (attributeValue) {
          throw new Error(
            `Couldn't find HTML-element with attribute "${dataAttribute}" with value "${attributeValue}". Present values are:\n\n"${validValues.join(
              '",\n"',
            )}"`,
          );
        }

        throw new Error(
          `Couldn't find HTML-element with attribute "${dataAttribute}"`,
        );
      }

      return { discovered, ...nestedDiscover };
    };

const getBaseElement = (source: DiscoverySourceTypes) =>
  "baseElement" in source ? source.baseElement : source;
