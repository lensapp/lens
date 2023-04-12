/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
export declare function unitsToBytes(value: string): number;
export interface BytesToUnitesOptions {
    /**
     * The number of decimal places. MUST be an integer. MUST be in the range [0, 20].
     * @default 1
     */
    precision?: number;
}
export declare function bytesToUnits(bytes: number, { precision }?: BytesToUnitesOptions): string;
