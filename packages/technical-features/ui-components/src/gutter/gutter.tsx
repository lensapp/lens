import React from "react";
import type { ShirtSize } from "../shirt-size";

export interface GutterProps {
  size?: ShirtSize;
}

const classNamesByShirtSize: Record<ShirtSize, string> = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  xl: "w-10 h-10",
};

export const Gutter = ({ size = "md" }: GutterProps) => (
  <div className={classNamesByShirtSize[size]} />
);
