// Helper for combining css classes inside components

import { NotFalsy } from "../../common/utils";

export type IClassName = undefined | string | string[] | IClassNameMap;
export type IClassNameMap = {
  [className: string]: boolean | any;
};

export function cssNames(...args: IClassName[]): string {
  const map: IClassNameMap = {};

  args.forEach(className => {
    if (typeof className === "string" || Array.isArray(className)) {
      [className].flat().filter(NotFalsy).forEach(name => map[name] = true);
    }
    else {
      Object.assign(map, className);
    }
  });

  return Object.entries(map)
    .filter(([, isActive]) => !!isActive)
    .map(([className]) => className.trim())
    .join(" ");
}
