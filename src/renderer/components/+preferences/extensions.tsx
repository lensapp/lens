/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observer } from "mobx-react";
import React from "react";
import { AppPreferenceRegistry } from "../../../extensions/registries";
import { ExtensionSettings } from "./extension-settings";

export const Extensions = observer(() => {
  const settings = AppPreferenceRegistry.getInstance().getItems();

  return (
    <section id="extensions">
      <h2>Extensions</h2>
      {settings.filter(e => !e.showInPreferencesTab).map((setting) =>
        <ExtensionSettings key={setting.id} setting={setting} size="small" />,
      )}
    </section>
  );
});
