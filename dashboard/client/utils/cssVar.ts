// Helper for getting/setting css-variables

export interface CSSVar {
  toString(): string;
  valueOf(): number;
}

export interface CSSVarWrapper {
  get(name: string): CSSVar;
  set(name: string, value: number | string): void;
}

export function cssVar(elem: HTMLElement): CSSVarWrapper {
  return {
    get(name: string): CSSVar {
      const value = window.getComputedStyle(elem).getPropertyValue(name).trim();
      return {
        toString: (): string => value,
        valueOf: (): number => parseFloat(value)
      };
    },
    set(name: string, value: number | string): void {
      if (typeof value === "number") {
        value = value + "px";
      }
      elem.style.setProperty(name, value);
    }
  };
}
