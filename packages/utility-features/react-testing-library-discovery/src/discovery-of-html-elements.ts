import type { RenderResult } from "@testing-library/react";
import { prettyDOM as prettyDom } from "@testing-library/dom";

type DiscoverySourceTypes = RenderResult | Element;

export type QuerySingleElement = (
  attributeName: string,
  attributeValue?: string
) => { discovered: Element | null } & Discover;

type Clickable = { click: () => void };

export type GetSingleElement = (
  attributeName: string,
  attributeValue?: string
) => { discovered: Element } & Discover & Clickable;

export type QueryAllElements = (attributeName: string) => {
  discovered: Element[];
  attributeValues: (string | null)[];
};

export interface Discover {
  querySingleElement: QuerySingleElement;
  queryAllElements: QueryAllElements;
  getSingleElement: GetSingleElement;
}

export const discoverFor = (
  getSource: () => DiscoverySourceTypes
): Discover => ({
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
        throw new Error(
          "Tried to do nested discover using source that does not exist"
        );
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
        result.getAttribute(dataAttribute)
      ),
    };
  };

export const getSingleElement =
  (getSource: () => DiscoverySourceTypes): GetSingleElement =>
  (attributeName, attributeValue) => {
    const dataAttribute = `data-${attributeName}-test`;

    const { discovered, ...nestedDiscover } = querySingleElement(getSource)(
      attributeName,
      attributeValue
    );

    if (!discovered) {
      const html = prettyDom(getBaseElement(getSource()));

      if (attributeValue) {
        const validValues =
          queryAllElements(getSource)(attributeName).attributeValues;

        throw new Error(
          `Couldn't find HTML-element with attribute "${dataAttribute}" with value "${attributeValue}".\n\nPresent values are:\n\n"${validValues.join(
            '",\n"'
          )}"\n\nHTML is:\n\n${html}`
        );
      }

      throw new Error(
        `Couldn't find HTML-element with attribute "${dataAttribute}"\n\nHTML is:\n\n${html}`
      );
    }

    const click = () => {
      if ("click" in discovered && typeof discovered.click === "function") {
        discovered.click();
      } else {
        throw new Error(
          `Tried to click something that was not clickable:\n\n${prettyDom(
            discovered
          )}`
        );
      }
    };

    return { discovered, click, ...nestedDiscover };
  };

const getBaseElement = (source: DiscoverySourceTypes) =>
  "baseElement" in source ? source.baseElement : source;
