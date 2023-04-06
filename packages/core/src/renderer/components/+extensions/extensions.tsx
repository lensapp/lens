/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./extensions.module.scss";
import React from "react";
import { DropFileInput } from "../input";
import { ExtensionInstall } from "./install";
import { InstalledExtensions } from "./installed-extensions";
import { Notice } from "./notice";
import { SettingLayout } from "../layout/setting-layout";
import { docsUrl } from "../../../common/vars";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { InstallOnDrop } from "./install-on-drop.injectable";
import installOnDropInjectable from "./install-on-drop.injectable";
import Gutter from "../gutter/gutter";

const ExtensionsNotice = () => (
  <Notice className={styles.notice}>
    <p>
      {"Add new features via Lens Extensions. Check out the "}
      <a
        href={`${docsUrl}/extensions/lens-extensions`}
        target="_blank"
        rel="noreferrer"
      >
        docs
      </a>
      {" and list of "}
      <a
        href="https://github.com/lensapp/lens-extensions/blob/main/README.md"
        target="_blank"
        rel="noreferrer"
      >
        available extensions
      </a>
      .
    </p>
  </Notice>
);

interface Dependencies {
  installOnDrop: InstallOnDrop;
}

const NonInjectedExtensions = ({ installOnDrop }: Dependencies) => (
  <DropFileInput onDropFiles={installOnDrop}>
    <SettingLayout
      className="Extensions"
      contentGaps={false}
      data-testid="extensions-page"
    >
      <section>
        <h1>Extensions</h1>
        <ExtensionsNotice />
        <ExtensionInstall />
        <Gutter size="md" />
        <InstalledExtensions />
      </section>
    </SettingLayout>
  </DropFileInput>
);

export const Extensions = withInjectables<Dependencies>(NonInjectedExtensions, {
  getProps: (di) => ({
    installOnDrop: di.inject(installOnDropInjectable),
  }),
});
