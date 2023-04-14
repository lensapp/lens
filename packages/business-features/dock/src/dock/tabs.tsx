import { Div } from "@k8slens/ui-components";
import React from "react";

export interface TabsProps {
  children: React.ReactNode;
}

export const Tabs = ({ children }: TabsProps) => (
  <Div _flexParent={{ centeredVertically: true }}>{children}</Div>
);

export interface TabProps {
  children: React.ReactNode;
}

const Tab = ({ children }: TabProps) => (
  <Div>{children}</Div>
);

Tabs.Tab = Tab;
