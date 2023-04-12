import type { RenderResult } from "@testing-library/react";
type DiscoverySourceTypes = RenderResult | Element;
export type QuerySingleElement = (attributeName: string, attributeValue?: string) => {
    discovered: Element | null;
} & Discover;
type Clickable = {
    click: () => void;
};
export type GetSingleElement = (attributeName: string, attributeValue?: string) => {
    discovered: Element;
} & Discover & Clickable;
export type QueryAllElements = (attributeName: string) => {
    discovered: Element[];
    attributeValues: (string | null)[];
};
export interface Discover {
    querySingleElement: QuerySingleElement;
    queryAllElements: QueryAllElements;
    getSingleElement: GetSingleElement;
}
export declare function querySingleElement(getSource: () => DiscoverySourceTypes): QuerySingleElement;
export declare function queryAllElements(getSource: () => DiscoverySourceTypes): QueryAllElements;
export declare function getSingleElement(getSource: () => DiscoverySourceTypes): GetSingleElement;
export declare function discoverFor(getSource: () => DiscoverySourceTypes): Discover;
export {};
