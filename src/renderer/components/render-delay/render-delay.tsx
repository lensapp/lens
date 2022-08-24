/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useEffect, useState } from "react";
import type { SingleOrMany } from "../../utils";
import type { RequestIdleCallback } from "./request-idle-callback.injectable";
import type { CancelIdleCallback } from "./cancel-idle-callback.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import cancelIdleCallbackInjectable from "./cancel-idle-callback.injectable";
import requestIdleCallbackInjectable from "./request-idle-callback.injectable";

export interface RenderDelayProps {
  placeholder?: React.ReactNode;
  children: SingleOrMany<React.ReactNode>;
}

interface Dependencies {
  requestIdleCallback: RequestIdleCallback;
  cancelIdleCallback: CancelIdleCallback;
}

const NonInjectedRenderDelay = (props: RenderDelayProps & Dependencies) => {
  const {
    cancelIdleCallback,
    requestIdleCallback,
    children,
    placeholder,
  } = props;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handle = requestIdleCallback(() => setIsVisible(true), { timeout: 1000 });

    return () => cancelIdleCallback(handle);
  }, []);

  return (
    <>
      {
        isVisible
          ? placeholder ?? null
          : children
      }
    </>
  );
};

export const RenderDelay = withInjectables<Dependencies, RenderDelayProps>(NonInjectedRenderDelay, {
  getProps: (di, props) => ({
    ...props,
    cancelIdleCallback: di.inject(cancelIdleCallbackInjectable),
    requestIdleCallback: di.inject(requestIdleCallbackInjectable),
  }),
});
