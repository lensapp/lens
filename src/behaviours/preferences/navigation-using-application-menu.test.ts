/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import isAutoUpdateEnabledInjectable from "../../main/is-auto-update-enabled.injectable";
import type { UserStore } from "../../common/user-store";
import userStoreInjectable from "../../common/user-store/user-store.injectable";
import type { ThemeStore } from "../../renderer/themes/store";
import themeStoreInjectable from "../../renderer/themes/store.injectable";

describe("preferences - navigation using application menu", () => {
  let applicationBuilder: ApplicationBuilder;
  let rendered: RenderResult;

  beforeEach(async () => {
    applicationBuilder = getApplicationBuilder();

    applicationBuilder.beforeSetups(({ rendererDi, mainDi }) => {
      mainDi.override(isAutoUpdateEnabledInjectable, () => () => false);

      const userStoreStub = {
        extensionRegistryUrl: { customUrl: "some-custom-url" },
      } as unknown as UserStore;

      rendererDi.override(userStoreInjectable, () => userStoreStub);

      const themeStoreStub = { themeOptions: [] } as unknown as ThemeStore;

      rendererDi.override(themeStoreInjectable, () => themeStoreStub);
    });

    rendered = await applicationBuilder.render();
  });

  it("renders", () => {
    expect(rendered.container).toMatchSnapshot();
  });

  it("does not show application preferences page yet", () => {
    const actual = rendered.queryByTestId("application-preferences-page");

    expect(actual).toBeNull();
  });

  describe("when navigating to preferences using application menu", () => {
    beforeEach(() => {
      applicationBuilder.applicationMenu.click("root.preferences");
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("shows application preferences page", () => {
      const actual = rendered.getByTestId("application-preferences-page");

      expect(actual).not.toBeNull();
    });
  });
});
