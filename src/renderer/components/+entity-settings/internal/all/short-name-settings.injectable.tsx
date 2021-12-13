/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ShortNameSetting } from "../../../entity-settings/short-name-setting";
import { entitySettingInjectionToken } from "../../token";

const catalogEntityShortNameSettingsInjectable = getInjectable({
  id: "catalog-entity-short-name-settings",
  instantiate: () => ({
    isFor: () => true,
    title: "Short Name",
    group: "Settings",
    id: "short-name",
    orderNumber: 11,
    components: {
      View: ShortNameSetting,
    },
  }),
  injectionToken: entitySettingInjectionToken,
});

export default catalogEntityShortNameSettingsInjectable;
