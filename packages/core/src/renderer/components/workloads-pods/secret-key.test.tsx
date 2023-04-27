/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import { base64 } from "@k8slens/utilities";
import type { RenderResult } from "@testing-library/react";
import { act } from "@testing-library/react";
import React from "react";
import type { SecretStore } from "../config-secrets/store";
import secretStoreInjectable from "../config-secrets/store.injectable";
import { Secret, SecretType } from "@k8slens/kube-object";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import { renderFor } from "../test-utils/renderFor";
import { SecretKey } from "./secret-key";

describe("SecretKey technical tests", () => {
  let loadSecretMock: AsyncFnMock<SecretStore["load"]>;
  let result: RenderResult;

  beforeEach(() => {
    const di = getDiForUnitTesting();
    const render = renderFor(di);

    loadSecretMock = asyncFn();
    di.override(secretStoreInjectable, () => ({
      load: loadSecretMock,
    } as Partial<SecretStore> as SecretStore));

    result = render((
      <SecretKey
        namespace="some-namespace"
        reference={{
          key: "some-key",
          name: "some-secret-name",
        }}
      />
    ));
  });

  it("renders", () => {
    expect(result.baseElement).toMatchSnapshot();
  });

  it("should not try to load secret", () => {
    expect(loadSecretMock).not.toBeCalled();
  });

  it("should show the 'show secret' button", () => {
    expect(result.queryByTestId("show-secret-button-for-some-namespace/some-secret-name:some-key")).toBeInTheDocument();
  });

  describe("when the show secret button is clicked", () => {
    beforeEach(() => {
      result
        .getByTestId("show-secret-button-for-some-namespace/some-secret-name:some-key")
        .click();
    });

    it("renders", () => {
      expect(result.baseElement).toMatchSnapshot();
    });

    it("should try to load secret", () => {
      expect(loadSecretMock).toBeCalledWith({
        name: "some-secret-name",
        namespace: "some-namespace",
      });
    });

    it("should mark icon as disabled", () => {
      expect(result.queryByTestId("show-secret-button-for-some-namespace/some-secret-name:some-key")).toHaveClass("disabled");
    });

    describe("when the secret loads with base64 encoded data", () => {
      beforeEach(async () => {
        await act(async () => {
          await loadSecretMock.resolve(new Secret({
            apiVersion: Secret.apiBase,
            kind: Secret.kind,
            metadata: {
              name: "some-secret-name",
              namespace: "some-namespace",
              resourceVersion: "some-resource-version",
              selfLink: "some-self-link",
              uid: "some-uid",
            },
            type: SecretType.Opaque,
            data: {
              "some-key": base64.encode("some-data-for-some-key"),
            },
          }));
        });
      });

      it("renders", () => {
        expect(result.baseElement).toMatchSnapshot();
      });

      it("should not show the 'show secret' button", () => {
        expect(result.queryByTestId("show-secret-button-for-some-namespace/some-secret-name:some-key")).not.toBeInTheDocument();
      });

      it("should show the decoded secret data", () => {
        expect(result.queryByText("some-data-for-some-key")).toBeInTheDocument();
      });
    });

    describe("when the secret loads with non base64 encoded data", () => {
      beforeEach(async () => {
        await act(async () => {
          await loadSecretMock.resolve(new Secret({
            apiVersion: Secret.apiBase,
            kind: Secret.kind,
            metadata: {
              name: "some-secret-name",
              namespace: "some-namespace",
              resourceVersion: "some-resource-version",
              selfLink: "some-self-link",
              uid: "some-uid",
            },
            type: SecretType.Opaque,
            data: {
              "some-key": "some-data-for-some-key",
            },
          }));
        });
      });

      it("renders", () => {
        expect(result.baseElement).toMatchSnapshot();
      });

      it("should not show the 'show secret' button", () => {
        expect(result.queryByTestId("show-secret-button-for-some-namespace/some-secret-name:some-key")).not.toBeInTheDocument();
      });

      it("should show the non decoded secret data", () => {
        expect(result.queryByText("some-data-for-some-key")).toBeInTheDocument();
      });
    });

    describe("when the secret fails to load with an error", () => {
      beforeEach(async () => {
        await act(async () => {
          await loadSecretMock.reject(new Error("some-error"));
        });
      });

      it("renders", () => {
        expect(result.baseElement).toMatchSnapshot();
      });

      it("should not show the 'show secret' button", () => {
        expect(result.queryByTestId("show-secret-button-for-some-namespace/some-secret-name:some-key")).not.toBeInTheDocument();
      });

      it("should show the loading error", () => {
        expect(result.queryByText("Error: some-error")).toBeInTheDocument();
      });
    });

    describe("when the secret fails to load with an object", () => {
      beforeEach(async () => {
        await act(async () => {
          await loadSecretMock.reject({ message: "some-error" });
        });
      });

      it("renders", () => {
        expect(result.baseElement).toMatchSnapshot();
      });

      it("should not show the 'show secret' button", () => {
        expect(result.queryByTestId("show-secret-button-for-some-namespace/some-secret-name:some-key")).not.toBeInTheDocument();
      });

      it("should show the loading error as JSON", () => {
        expect(result.queryByText(`Error: {"message":"some-error"}`)).toBeInTheDocument();
      });
    });

    describe("when the secret fails to load with a primitive", () => {
      beforeEach(async () => {
        await act(async () => {
          await loadSecretMock.reject("some-other-error");
        });
      });

      it("renders", () => {
        expect(result.baseElement).toMatchSnapshot();
      });

      it("should not show the 'show secret' button", () => {
        expect(result.queryByTestId("show-secret-button-for-some-namespace/some-secret-name:some-key")).not.toBeInTheDocument();
      });

      it("should show the loading error as JSON", () => {
        expect(result.queryByText("Error: some-other-error")).toBeInTheDocument();
      });
    });
  });
});
