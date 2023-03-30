/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainerForInjection } from "@ogre-tools/injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { DiContextProvider } from "@ogre-tools/injectable-react";
import { flow, identity } from "lodash/fp";
import { observer } from "mobx-react";
import React from "react";
import { reactApplicationWrapperInjectionToken } from "./react-application-wrapper-injection-token";

import { ReactApplicationContent } from "./react-application-content";

interface ReactApplicationProps {
  di: DiContainerForInjection;
}

export const ReactApplication = observer(({ di }: ReactApplicationProps) => {
  const computedInjectMany = di.inject(computedInjectManyInjectable);

  const wrappers = computedInjectMany(reactApplicationWrapperInjectionToken);

  const ContentWithWrappers = flow(identity, ...wrappers.get())(ReactApplicationContent);

  return (
    <DiContextProvider value={{ di }}>
      <ContentWithWrappers />
    </DiContextProvider>
  );
});
