/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import { flow } from "lodash/fp";
import type { HTMLAttributes, MouseEventHandler } from "react";
import React from "react";
import type { OnClickDecorator } from "./on-click-decorator-injection-token";
import {  onClickDecoratorInjectionToken } from "./on-click-decorator-injection-token";

interface Dependencies {
  decorators: OnClickDecorator[];
}

interface ClickDecoratedProps extends HTMLAttributes<any> {
  onClick?: MouseEventHandler<any>;
  tagName: "button" | "a";
}

const NonInjectedOnClickDecorated = ({ decorators, tagName: TagName, onClick, ...props }: Dependencies & ClickDecoratedProps) => {
  const onClickDecorators = decorators.map(decorator => decorator.onClick);

  const decoratedOnClick = onClick ? flow(...onClickDecorators)(onClick) : undefined;

  return <TagName {...props} onClick={decoratedOnClick} />;
};

export const OnClickDecorated = withInjectables<Dependencies, ClickDecoratedProps>(
  NonInjectedOnClickDecorated,

  {
    getProps: (di, props) => ({
      decorators: di.injectMany(onClickDecoratorInjectionToken),
      ...props,
    }),
  },
);
