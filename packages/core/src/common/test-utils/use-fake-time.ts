/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { act } from "@testing-library/react";

let usingFakeTime = false;

export const advanceFakeTime = (milliseconds: number) => {
  if (!usingFakeTime) {
    throw new Error("Tried to advance fake time but it was not enabled. Call useFakeTime() first.");
  }

  act(() => {
    jest.advanceTimersByTime(milliseconds);
  });
};

export interface TestUsingFakeTimeOptions {
  dateTime?: string;
  autoAdvance?: boolean;
}

export const testUsingFakeTime = ({ autoAdvance = false, dateTime: dateTime = "2015-10-21T07:28:00Z" }: TestUsingFakeTimeOptions = {}) => {
  usingFakeTime = true;

  const setInterval = global.setInterval;

  jest.useFakeTimers();

  if (autoAdvance) {
    setInterval(() => advanceFakeTime(100), 100);
  }

  jest.setSystemTime(new Date(dateTime));
};
