/**
 * Narrows `val` to include the property `key` (if true is returned)
 * @param val The object to be tested
 * @param key The key to test if it is present on the object
 */
export function hasOwnProperty<V extends object, K extends PropertyKey>(val: V, key: K): val is (V & { [key in K]: unknown }) {
  // this call syntax is for when `val` was created by `Object.create(null)`
  return Object.prototype.hasOwnProperty.call(val, key);
}

export function hasOwnProperties<V extends object, K extends PropertyKey>(val: V, ...keys: K[]): val is (V & { [key in K]: unknown}) {
  return keys.every(key => hasOwnProperty(val, key));
}
