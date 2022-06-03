/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { TypedArray } from "type-fest";

export type IpcPrimative = string | boolean | number | bigint | null | undefined;
export type IpcClasses = Date | RegExp | TypedArray;
export type IpcValue = IpcPrimative | IpcObject | IpcArray | IpcClasses;
export type IpcObject = { [Key in string]?: IpcValue };
export type IpcArray = IpcValue[];
