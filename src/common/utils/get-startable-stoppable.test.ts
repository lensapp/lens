/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getStartableStoppable } from "./get-startable-stoppable";

describe("getStartableStoppable", () => {
  let stopMock: jest.Mock<() => void>;
  let startMock: jest.Mock<() => () => void>;
  let actual: { stop: () => void; start: () => void };

  beforeEach(() => {
    stopMock = jest.fn();
    startMock = jest.fn(() => stopMock);

    actual = getStartableStoppable(startMock);
  });

  it("does not start yet", () => {
    expect(startMock).not.toHaveBeenCalled();
  });

  it("does not stop yet", () => {
    expect(stopMock).not.toHaveBeenCalled();
  });

  it("when stopping before ever starting, throws", () => {
    expect(() => {
      actual.stop();
    }).toThrow("Tried to stop something that has not started yet.");
  });

  describe("when started", () => {
    beforeEach(() => {
      actual.start();
    });

    it("starts", () => {
      expect(startMock).toHaveBeenCalled();
    });

    it("does not stop yet", () => {
      expect(stopMock).not.toHaveBeenCalled();
    });

    describe("when stopped", () => {
      beforeEach(() => {
        actual.stop();
      });

      it("stops", () => {
        expect(stopMock).toHaveBeenCalled();
      });

      it("when stopped again, throws", () => {
        expect(() => {
          actual.stop();
        }).toThrow("Tried to stop something that has already stopped.");
      });

      it("when started again, throws for restart being YAGNI with logical blind spots", () => {
        expect(() => {
          actual.start();
        }).toThrow("Tried to restart something that has stopped.");
      });
    });
  });
});
