/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
export const prepend = (prependWith: string) => (what: string) => `${prependWith}${what}`;
