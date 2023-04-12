/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
/**
 * Split `name` into the parts seperated by one or more of (-, _, or .) and
 * the sections can be converted to numbers will be converted
 * @param name A kube object name
 * @returns The converted parts of the name
 */
export declare function getConvertedParts(name: string): (string | number)[];
