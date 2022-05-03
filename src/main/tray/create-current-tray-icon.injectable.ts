/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import nativeThemeInjectable from "../electron/native-theme.injectable";
import { createTrayIcon } from "./create-tray-icon";
import LogoLens from "../../renderer/components/icon/logo-lens.svg";

const createCurrentTrayIconInjectable = getInjectable({
  id: "create-current-tray-icon",
  instantiate: (di) => {
    const nativeTheme = di.inject(nativeThemeInjectable);

    return () => createTrayIcon({
      shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
      size: 16,
      sourceSvg: LogoLens,
    });
  },
});

export default createCurrentTrayIconInjectable;
