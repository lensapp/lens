/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onQuitOfBackEndInjectionToken } from "../../../main/start-main-application/runnable-tokens/phases";
import weblinkVerificationStartableStoppableInjectable from "./weblink-verification.injectable";

const stopValidatingWeblinksInjectable = getInjectable({
  id: "stop-validating-weblinks",
  instantiate: (di) => ({
    run: () => {
      const weblinkVerificationStartableStoppable = di.inject(weblinkVerificationStartableStoppableInjectable);

      weblinkVerificationStartableStoppable.stop();

      return undefined;
    },
  }),
  injectionToken: onQuitOfBackEndInjectionToken,
});

export default stopValidatingWeblinksInjectable;
