/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import type { AskBoolean } from "./ask-boolean.injectable";
import askBooleanInjectable from "./ask-boolean.injectable";
import { getPromiseStatus } from "../../common/test-utils/get-promise-status";
import type { RenderResult } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import getRandomIdInjectable from "../../common/utils/get-random-id.injectable";

describe("ask-boolean", () => {
  let applicationBuilder: ApplicationBuilder;
  let askBoolean: AskBoolean;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder();

    const getRandomIdFake = jest
      .fn()
      .mockReturnValueOnce("some-random-id-1")
      .mockReturnValueOnce("some-random-id-2");

    applicationBuilder.dis.mainDi.override(getRandomIdInjectable, () => getRandomIdFake);

    askBoolean = applicationBuilder.dis.mainDi.inject(askBooleanInjectable);
  });

  describe("given started", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      rendered = await applicationBuilder.render();
    });

    describe("when asking question", () => {
      let actualPromise: Promise<boolean>;

      beforeEach(() => {
        actualPromise = askBoolean({
          title: "some-title",
          question: "Some question",
        });
      });

      it("does not resolve yet", async () => {
        const promiseStatus = await getPromiseStatus(actualPromise);

        expect(promiseStatus.fulfilled).toBe(false);
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("shows notification", () => {
        const notification = rendered.getByTestId("ask-boolean-some-random-id-1");

        expect(notification).not.toBeUndefined();
      });

      describe('when user answers "yes"', () => {
        beforeEach(() => {
          const button = rendered.getByTestId("ask-boolean-some-random-id-1-button-yes");

          fireEvent.click(button);
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        it("does not show notification anymore", () => {
          const notification = rendered.queryByTestId("ask-boolean-some-random-id-1");

          expect(notification).toBeNull();
        });

        it("resolves", async () => {
          const actual = await actualPromise;

          expect(actual).toBe(true);
        });
      });

      describe('when user answers "no"', () => {
        beforeEach(() => {
          const button = rendered.getByTestId("ask-boolean-some-random-id-1-button-no");

          fireEvent.click(button);
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        it("does not show notification anymore", () => {
          const notification = rendered.queryByTestId("ask-boolean-some-random-id-1");

          expect(notification).toBeNull();
        });

        it("resolves", async () => {
          const actual = await actualPromise;

          expect(actual).toBe(false);
        });
      });

      describe("when user closes notification without answering the question", () => {
        beforeEach(() => {
          const button = rendered.getByTestId("close-notification-for-ask-boolean-for-some-random-id-1");

          fireEvent.click(button);
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        it("does not show notification anymore", () => {
          const notification = rendered.queryByTestId("ask-boolean-some-random-id-1");

          expect(notification).toBeNull();
        });

        it("resolves", async () => {
          const actual = await actualPromise;

          expect(actual).toBe(false);
        });
      });
    });

    describe("when asking multiple questions", () => {
      let firstQuestionPromise: Promise<boolean>;
      let secondQuestionPromise: Promise<boolean>;

      beforeEach(() => {
        firstQuestionPromise = askBoolean({
          title: "some-title",
          question: "Some question",
        });

        secondQuestionPromise = askBoolean({
          title: "some-other-title",
          question: "Some other question",
        });
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("shows notification for first question", () => {
        const notification = rendered.getByTestId("ask-boolean-some-random-id-1");

        expect(notification).not.toBeUndefined();
      });

      it("shows notification for second question", () => {
        const notification = rendered.getByTestId("ask-boolean-some-random-id-2");

        expect(notification).not.toBeUndefined();
      });

      describe("when answering to first question", () => {
        beforeEach(() => {
          const button = rendered.getByTestId("ask-boolean-some-random-id-1-button-no");

          fireEvent.click(button);
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        it("does not show notification for first question anymore", () => {
          const notification = rendered.queryByTestId("ask-boolean-some-random-id-1");

          expect(notification).toBeNull();
        });

        it("still shows notification for second question", () => {
          const notification = rendered.getByTestId("ask-boolean-some-random-id-2");

          expect(notification).not.toBeUndefined();
        });

        it("resolves first question", async () => {
          const actual = await firstQuestionPromise;

          expect(actual).toBe(false);
        });

        it("does not resolve second question yet", async () => {
          const promiseStatus = await getPromiseStatus(secondQuestionPromise);

          expect(promiseStatus.fulfilled).toBe(false);
        });
      });
    });
  });
});
