/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "../electron-app.injectable";
import isMacInjectable from "../../../common/vars/is-mac.injectable";
import commandLineArgumentsInjectable from "../../utils/command-line-arguments.injectable";

const shouldStartHiddenInjectable = getInjectable({
  id: "should-start-hidden",

  instantiate: (di) => {
    const app = di.inject(electronAppInjectable);
    const isMac = di.inject(isMacInjectable);
    const commandLineArguments = di.inject(commandLineArgumentsInjectable);

    // Start the app without showing the main window when auto starting on login
    // (On Windows and Linux, we get a flag. On MacOS, we get special API.)
    return (
      commandLineArguments.includes("--hidden") ||
      (isMac && app.getLoginItemSettings().wasOpenedAsHidden)
    );
  },
});

export default shouldStartHiddenInjectable;
