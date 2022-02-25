/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { attemptInstalls } from "./attempt-installs";
import attemptInstallInjectable from "../attempt-install/attempt-install.injectable";

const attemptInstallsInjectable = getInjectable({
  id: "attempt-installs",

  instantiate: (di) =>
    attemptInstalls({
      attemptInstall: di.inject(attemptInstallInjectable),
    }),
});

export default attemptInstallsInjectable;
