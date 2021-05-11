import React from "react";
import { makeStyles, Tooltip, TooltipProps } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  arrow: {
    color: "var(--tooltipBackground)",
  },
  tooltip: {
    fontSize: 12,
    backgroundColor: "var(--tooltipBackground)",
    color: "var(--textColorAccent)",
    padding: 8,
    boxShadow: "0 8px 16px rgba(0,0,0,0.24)"
  },
}));

export function MaterialTooltip(props: TooltipProps) {
  const classes = useStyles();

  return (
    <Tooltip classes={classes} {...props}/>
  );
}

MaterialTooltip.defaultProps = {
  arrow: true
};

