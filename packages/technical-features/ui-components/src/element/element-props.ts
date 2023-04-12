import type React from "react";

export {};

declare global {
  interface ElementProps {
    children?: React.ReactNode;
  }
}
