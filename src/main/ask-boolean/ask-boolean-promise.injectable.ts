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
    let _promise: Promise<boolean>;

    return ({
      get promise() {
        return _promise;
      },

      clear: () => {
        _promise = new Promise(_resolve => {
          resolve = _resolve;
        });
      },

      resolve: (value: boolean) => {
        resolve(value); },
    });
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, questionId: string) => questionId,
  }),
});

export default askBooleanPromiseInjectable;
