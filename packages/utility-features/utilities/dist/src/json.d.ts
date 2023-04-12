/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Result } from "./result";
export declare const json: {
    parse: (input: string) => Result<unknown, Error>;
};
