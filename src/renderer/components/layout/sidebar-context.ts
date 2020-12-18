import React from "react";

export const SidebarContext = React.createContext<SidebarContextValue>({ pinned: false });

export type SidebarContextValue = {
  pinned: boolean;
};