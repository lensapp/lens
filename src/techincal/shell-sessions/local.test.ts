/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import getShellAuthTokenChannelHandlerInjectable from "../../main/lens-proxy/proxy-functions/shell/auth-token-channel-handler.injectable";
import type { GetShellAuthToken } from "../../common/shell-authentication/get-auth-token.injectable";
import spawnPtyInjectable from "../../main/shell-session/spawn-pty.injectable";

describe("local shell session techincal tests", () => {
  let builder: ApplicationBuilder;
  let result: RenderResult;
  let authenticationSpy: jest.SpyInstance<Uint8Array | Promise<Uint8Array>, Parameters<GetShellAuthToken>>;

  beforeEach(async () => {
    builder = getApplicationBuilder()
      .beforeApplicationStart(() => {
        builder.dis.mainDi.override(spawnPtyInjectable, () => jest.fn());
      })
      .beforeRender(() => {
        const shellAuthentication = builder.dis.mainDi.inject(getShellAuthTokenChannelHandlerInjectable);

        authenticationSpy = jest.spyOn(shellAuthentication, "handler");
      });
    builder.setEnvironmentToClusterFrame();

    result = await builder.render();
    builder.dock.click(0);
  });

  it("renders", () => {
    expect(result.baseElement).toMatchSnapshot();
  });

  it("should call the authentication function", () => {
    expect(authenticationSpy).toBeCalled();
  });
});
