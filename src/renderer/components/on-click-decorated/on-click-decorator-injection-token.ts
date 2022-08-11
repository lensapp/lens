/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { MouseEventHandler } from "react";
import type React from "react";

type OnClick = (toBeDecorated: MouseEventHandler<any>) => (event: React.MouseEvent) => void;

export interface OnClickDecorator {
  onClick: OnClick;
}

export const onClickDecoratorInjectionToken = getInjectionToken<OnClickDecorator>({
  id: "onclick-decorator-injection-token",
});
