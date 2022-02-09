/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { installOnDrop } from "./install-on-drop";
import attemptInstallsInjectable from "../attempt-installs/attempt-installs.injectable";

const installOnDropInjectable = getInjectable({
  id: "install-on-drop",

  instantiate: (di) =>
    installOnDrop({
      attemptInstalls: di.inject(attemptInstallsInjectable),
    }),
});

export default installOnDropInjectable;
