/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";

const askBooleanPromiseInjectable = getInjectable({
  id: "ask-boolean-promise",

  instantiate: (di, questionId: string) => {
    void questionId;

    let resolve: (value: boolean) => void;

    const promise = new Promise<boolean>(_resolve => {
      resolve = _resolve;
    });

    return ({
      promise,

      resolve: (value: boolean) => {
        resolve(value);
      },
    });
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, questionId: string) => questionId,
  }),
});

export default askBooleanPromiseInjectable;
