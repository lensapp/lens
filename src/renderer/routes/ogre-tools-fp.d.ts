/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
declare module "@ogre-tools/fp" {
  interface Pipeline {
    <A, R1, R2, R3, R4, R5, R6, R7, R8, R9>(
      arg: A,
      f1: (arg: A) => R1,
      f2: (arg: R1) => R2,
      f3: (arg: R2) => R3,
      f4: (arg: R3) => R4,
      f5: (arg: R4) => R5,
      f6: (arg: R5) => R6,
      f7: (arg: R6) => R7,
      f8: (arg: R7) => R8,
      f9: (arg: R8) => R9,
    ): R9;

    <A, R1, R2, R3, R4, R5, R6, R7, R8>(
      arg: A,
      f1: (arg: A) => R1,
      f2: (arg: R1) => R2,
      f3: (arg: R2) => R3,
      f4: (arg: R3) => R4,
      f5: (arg: R4) => R5,
      f6: (arg: R5) => R6,
      f7: (arg: R6) => R7,
      f8: (arg: R7) => R8,
    ): R8;

    <A, R1, R2, R3, R4, R5, R6, R7>(
      arg: A,
      f1: (arg: A) => R1,
      f2: (arg: R1) => R2,
      f3: (arg: R2) => R3,
      f4: (arg: R3) => R4,
      f5: (arg: R4) => R5,
      f6: (arg: R5) => R6,
      f7: (arg: R6) => R7,
    ): R7;

    <A, R1, R2, R3, R4, R5, R6>(
      arg: A,
      f1: (arg: A) => R1,
      f2: (arg: R1) => R2,
      f3: (arg: R2) => R3,
      f4: (arg: R3) => R4,
      f5: (arg: R4) => R5,
      f6: (arg: R5) => R6,
    ): R6;

    <A, R1, R2, R3, R4, R5>(
      arg: A,
      f1: (arg: A) => R1,
      f2: (arg: R1) => R2,
      f3: (arg: R2) => R3,
      f4: (arg: R3) => R4,
      f5: (arg: R4) => R5,
    ): R5;

    <A, R1, R2, R3, R4>(
      arg: A,
      f1: (arg: A) => R1,
      f2: (arg: R1) => R2,
      f3: (arg: R2) => R3,
      f4: (arg: R3) => R4,
    ): R4;

    <A, R1, R2, R3>(
      arg: A,
      f1: (arg: A) => R1,
      f2: (arg: R1) => R2,
      f3: (arg: R2) => R3,
    ): R3;

    <A, R1, R2>(arg: A, f1: (arg: A) => R1, f2: (arg: R1) => R2): R2;

    <A, R1>(arg: A, f1: (arg: A) => R1): R1;
  }

  export const pipeline: Pipeline;
}
