/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// See: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
export interface Discriminable<T extends string> { readonly kind: T }

// Note: this will fail at transpilation time, if all kinds are not instructed in switch/case.
// See: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
export const checkThatAllDiscriminablesAreExhausted = <T extends never>(value: T) => {
  const _exhaustiveCheck: never = value;

  return new Error(
    `Tried to exhaust discriminables, but no instructions were found for ${(_exhaustiveCheck as any).kind}`,
  );
};
