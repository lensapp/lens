// Convert object's keys to camelCase format
import { camelCase, isPlainObject } from "lodash";

export function toCamelCase(data: any): any {
  if (Array.isArray(data)) {
    return data.map(toCamelCase);
  }
  else if (isPlainObject(data)) {
    return Object.keys(data).reduce<any>((result, key) => {
      const value = data[key];
      result[camelCase(key)] = typeof value === "object" ? toCamelCase(value) : value;
      return result;
    }, {});
  }
  else {
    return data;
  }
}
