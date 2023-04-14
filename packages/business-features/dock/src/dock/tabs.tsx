import { Div } from "@k8slens/ui-components";
import React from "react";
import type { DivProps } from "@k8slens/ui-components";

export interface TabsProps {
  children: React.ReactNode;
}

export const Tabs = ({ children }: TabsProps) => (
  <Div _flexParent={{ centeredVertically: true }}>{children}</Div>
);

export type TabProps = {
  children: React.ReactNode;
} & DivProps;

const Tab = ({ ...props }: TabProps) => <Div {...props} />;

Tabs.Tab = Tab;
