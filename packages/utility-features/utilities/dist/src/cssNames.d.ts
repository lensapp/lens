/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
export type IgnoredClassNames = number | symbol | Function;
export type IClassName = string | string[] | Record<string, any> | undefined | null | false | IgnoredClassNames;
export declare function cssNames(...classNames: IClassName[]): string;
