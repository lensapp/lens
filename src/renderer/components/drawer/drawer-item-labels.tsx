import React from "react";
import { DrawerItem, DrawerItemProps } from "./drawer-item";
import { Badge } from "../badge";

interface Props extends DrawerItemProps {
  labels: string[];
}

export function DrawerItemLabels(props: Props) {
  const { labels, ...itemProps } = props;
  if (!labels || !labels.length) {
    return null;
  }
  return (
    <DrawerItem {...itemProps} labelsOnly>
      {labels.map(label => <Badge key={label} label={label} title={label}/>)}
    </DrawerItem>
  )
}
