import { Div } from "@k8slens/ui-components";
import React from "react";

export interface TabProps {
  children: React.ReactNode;
}

export const Tab = ({ children }: TabProps) => {
  return (
    <Div _className="Tab flex gaps align-center">
      <div className="label">{children}</div>
    </Div>
  );
};
