// Convert object's keys to camelCase format
import { camelCase, isPlainObject } from "lodash";

export function toCamelCase(obj: Record<string, any>): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  else if (isPlainObject(obj)) {
    return Object.keys(obj).reduce((result, key) => {
      const value = obj[key];

      result[camelCase(key)] = typeof value === "object" ? toCamelCase(value) : value;

      return result;
    }, {} as any);
  }
  else {
    return obj;
  }
}
