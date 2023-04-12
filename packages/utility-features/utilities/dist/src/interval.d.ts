/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
export interface IntervalFn {
    start(runImmediately?: boolean): void;
    stop(): void;
    restart(runImmediately?: boolean): void;
    readonly isRunning: boolean;
}
export declare function interval(timeSec: number | undefined, callback: (count: number) => void, autoRun?: boolean): IntervalFn;
