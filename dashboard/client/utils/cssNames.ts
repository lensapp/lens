// Helper for combining css classes inside components

export type ClassName = string | string[] | ClassNameMap;
export interface ClassNameMap {
  [className: string]: boolean | any;
}

export function cssNames(...args: ClassName[]): string {
  const map: ClassNameMap = {};
  args.forEach(className => {
    if (typeof className === "string" || Array.isArray(className)) {
      [].concat(className).forEach(name => map[name] = true);
    } else {
      Object.assign(map, className);
    }
  });
  return Object.entries(map)
    .filter(([_className, isActive]) => !!isActive)
    .map(([className]) => className.trim())
    .join(' ');
}
