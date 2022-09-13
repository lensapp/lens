/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { createInitializableState } from "../../../common/initializable-state/create";
import { buildVersionInjectionToken } from "../../../common/vars/build-semantic-version.injectable";
import electronAppInjectable from "../../electron-app/electron-app.injectable";

const buildVersionInjectable = createInitializableState({
  id: "build-version",
  init: (di) => di.inject(electronAppInjectable).getVersion(),
  injectionToken: buildVersionInjectionToken,
});

export default buildVersionInjectable;
