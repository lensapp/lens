import type { ClassName } from "../class-names/class-names";

declare global {
  interface ElementProps {
    _className?: ClassName;
    _flexParent?: { centeredVertically: boolean } | boolean;
  }
}

export const flexParentModification = <T extends ElementProps>({
  _flexParent,
  _className,
  ...props
}: T) => {
  if (!_flexParent) {
    return { _className, ...props };
  }

  const centeredVertically =
    typeof _flexParent === "boolean" ? false : _flexParent.centeredVertically;

  return {
    ...props,

    _className: [
      "flex",

      {
        "align-center": centeredVertically,
      },

      _className,
    ],
  };
};
