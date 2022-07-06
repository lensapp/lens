/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import getShellAuthTokenChannelHandlerInjectable from "../../main/lens-proxy/proxy-functions/shell/auth-token-channel-handler.injectable";
import type { GetShellAuthToken } from "../../common/shell-authentication/get-auth-token.injectable";
import type { SpawnPty } from "../../main/shell-session/spawn-pty.injectable";
import spawnPtyInjectable from "../../main/shell-session/spawn-pty.injectable";
import type { IPty } from "node-pty";

describe("local shell session techincal tests", () => {
  let builder: ApplicationBuilder;
  let result: RenderResult;
  let authenticationSpy: jest.SpyInstance<Uint8Array | Promise<Uint8Array>, Parameters<GetShellAuthToken>>;
  let spawnPtyMock: jest.MockedFunction<SpawnPty>;
  let ptyMock: jest.MockedObject<IPty>;

  beforeEach(async () => {
    builder = getApplicationBuilder()
      .beforeApplicationStart(() => {
        spawnPtyMock = jest.fn();
        builder.dis.mainDi.override(spawnPtyInjectable, () => spawnPtyMock);

        spawnPtyMock.mockImplementation(() => ptyMock = {
          cols: 80,
          rows: 40,
          pid: 12346,
          process: "my-mocked-shell",
          handleFlowControl: true,
          kill: jest.fn(),
          onData: jest.fn(),
          onExit: jest.fn(),
          on: jest.fn(),
          resize: jest.fn(),
          write: jest.fn(),
          pause: jest.fn(),
          resume: jest.fn(),
        });
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

  it("should create a pty instance", async () => {
    await waitFor(() => expect(spawnPtyMock).toBeCalled());
    void ptyMock;
  });
});
