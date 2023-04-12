import { ElementFor } from "./element";
import type React from "react";

export const Div = ElementFor<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>("div");
export const Span = ElementFor<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>("span");
