/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { attemptInstalls } from "./attempt-installs";
import attemptInstallInjectable from "../attempt-install/attempt-install.injectable";

const attemptInstallsInjectable = getInjectable({
  instantiate: (di) =>
    attemptInstalls({
      attemptInstall: di.inject(attemptInstallInjectable),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default attemptInstallsInjectable;
