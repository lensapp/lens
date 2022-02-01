/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * An EmitterChannel represents a broadcast point where any side can emit data
 * on
 */
export type EmitterChannel<Parameters extends any[]> = (...args: Parameters) => void;
