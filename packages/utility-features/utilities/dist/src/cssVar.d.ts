/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
export declare function cssVar(elem: HTMLElement): {
    get(name: string): {
        toString: () => string;
        valueOf: () => number;
    };
    set(name: string, value: number | string): void;
};
