/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
/**
 * A better typed version of `Object.fromEntries` where the keys are known to
 * be a specific subset
 */
declare function fromEntries<T, Key extends string>(entries: Iterable<readonly [Key, T]>): Record<Key, T>;
declare function keys<K extends keyof any>(obj: Partial<Record<K, any>>): K[];
declare function entries<K extends string, V>(obj: Partial<Record<K, V>> | null | undefined): [K, V][];
declare function entries<K extends string | number | symbol, V>(obj: Partial<Record<K, V>> | null | undefined): [K, V][];
declare function entries<K extends string | number | symbol, V>(obj: Record<K, V> | null | undefined): [K, V][];
export declare const object: {
    entries: typeof entries;
    fromEntries: typeof fromEntries;
    keys: typeof keys;
};
export {};
