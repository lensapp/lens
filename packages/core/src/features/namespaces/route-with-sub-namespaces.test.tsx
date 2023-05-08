/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { RenderResult } from "@testing-library/react";
import navigateToNamespacesInjectable from "../../common/front-end-routing/routes/cluster/namespaces/navigate-to-namespaces.injectable";
import type { RequestDeleteNormalNamespace } from "../../renderer/components/namespaces/request-delete-normal-namespace.injectable";
import requestDeleteNormalNamespaceInjectable from "../../renderer/components/namespaces/request-delete-normal-namespace.injectable";
import type { RequestDeleteSubNamespaceAnchor } from "../../renderer/components/namespaces/request-delete-sub-namespace.injectable";
import requestDeleteSubNamespaceAnchorInjectable from "../../renderer/components/namespaces/request-delete-sub-namespace.injectable";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("namespaces route when viewed with some subNamespaces", () => {
  let builder: ApplicationBuilder;
  let result: RenderResult;
  let requestDeleteNormalNamespaceMock: AsyncFnMock<RequestDeleteNormalNamespace>;
  let requestDeleteSubNamespaceAnchorMock: AsyncFnMock<RequestDeleteSubNamespaceAnchor>;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    builder.setEnvironmentToClusterFrame();

    builder.namespaces.add("default");
    builder.namespaces.add("foobar");
    builder.namespaces.addSubNamespace("my-sub-namespace", "default");

    requestDeleteNormalNamespaceMock = asyncFn();
    requestDeleteSubNamespaceAnchorMock = asyncFn();

    builder.beforeWindowStart(({ windowDi }) => {
      windowDi.override(requestDeleteNormalNamespaceInjectable, () => requestDeleteNormalNamespaceMock);
      windowDi.override(requestDeleteSubNamespaceAnchorInjectable, () => requestDeleteSubNamespaceAnchorMock);
    });

    builder.afterWindowStart(() => {
      builder.allowKubeResource({ group: "", apiName: "namespaces" });
    });

    result = await builder.render();
  });

  describe("when navigating to namespaces view", () => {
    beforeEach(() => {
      builder.navigateWith(navigateToNamespacesInjectable);
    });

    it("renders", () => {
      expect(result.baseElement).toMatchSnapshot();
    });

    it("shows the default namespace", () => {
      expect(result.queryByText("default")).toBeInTheDocument();
    });

    it("shows the foobar namespace", () => {
      expect(result.queryByText("foobar")).toBeInTheDocument();
    });

    it("shows the my-sub-namespace namespace", () => {
      expect(result.queryByText("my-sub-namespace")).toBeInTheDocument();
    });

    describe("when clicking on the default namespace context menu button", () => {
      beforeEach(() => {
        result.getByTestId("icon-for-menu-actions-for-kube-object-menu-for-namespace-default").click();
      });

      it("renders", () => {
        expect(result.baseElement).toMatchSnapshot();
      });

      it("shows the context menu", () => {
        expect(result.getByTestId("menu-actions-for-kube-object-menu-for-namespace-default")).toBeInTheDocument();
      });

      describe("when clicking the delete action in the context menu", () => {
        beforeEach(() => {
          result.getByTestId("menu-action-delete-for-/api/v1/namespaces/default").click();
        });

        it("should not call requestDeleteSubNamespaceAnchor", () => {
          expect(requestDeleteSubNamespaceAnchorMock).not.toBeCalled();
        });

        it("should call requestDeleteNormalNamespace", () => {
          expect(requestDeleteNormalNamespaceMock).toBeCalled();
        });
      });
    });

    describe("when clicking on the my-sub-namespace namespace context menu button", () => {
      beforeEach(() => {
        result.getByTestId("icon-for-menu-actions-for-kube-object-menu-for-namespace-my-sub-namespace").click();
      });

      it("renders", () => {
        expect(result.baseElement).toMatchSnapshot();
      });

      it("shows the context menu", () => {
        expect(result.getByTestId("menu-actions-for-kube-object-menu-for-namespace-my-sub-namespace")).toBeInTheDocument();
      });

      describe("when clicking the delete action in the context menu", () => {
        beforeEach(() => {
          result.getByTestId("menu-action-delete-for-/api/v1/namespaces/my-sub-namespace").click();
        });

        it("should call requestDeleteSubNamespaceAnchor", () => {
          expect(requestDeleteSubNamespaceAnchorMock).toBeCalled();
        });

        describe("when requestDeleteSubNamespaceAnchor resolves", () => {
          beforeEach(async () => {
            await requestDeleteSubNamespaceAnchorMock.resolve();
          });

          it("should call requestDeleteNormalNamespace", () => {
            expect(requestDeleteNormalNamespaceMock).toBeCalled();
          });
        });
      });
    });
  });
});
