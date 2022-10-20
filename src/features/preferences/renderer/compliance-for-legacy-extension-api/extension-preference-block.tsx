/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { SubTitle } from "../../../../renderer/components/layout/sub-title";
import type { AppPreferenceRegistration } from "./app-preference-registration";
import React from "react";

export interface ExtensionSettingsProps {
  registration: AppPreferenceRegistration;
}

export function ExtensionPreferenceBlock({ registration }: ExtensionSettingsProps) {
  const {
    title,
    id,
    components: { Hint, Input },
  } = registration;

  return (
    <React.Fragment>
      <section
        id={id}
        className="small"
      >
        <SubTitle title={title} />
        <Input />
        <div className="hint">
          <Hint />
        </div>
      </section>
      <hr className="small" />
    </React.Fragment>
  );
}
