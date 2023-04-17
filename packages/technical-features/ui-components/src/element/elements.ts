import { ElementFor } from "./element";
import type React from "react";

type PropsByElement<T> = T extends React.ComponentType<infer I> ? I : never;

export const Div = ElementFor<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>("div");
export type DivProps = PropsByElement<typeof Div>;

export const Span = ElementFor<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>("span");
export type SpanProps = PropsByElement<typeof Span>;
