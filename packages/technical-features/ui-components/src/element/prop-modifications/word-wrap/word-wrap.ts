import type { ClassName } from "../class-names/class-names";

declare global {
  interface ElementProps {
    _className?: ClassName;
    _wordWrap?: boolean;
  }
}

export const wordWrapModification = <T extends ElementProps>({
  _wordWrap,
  _className,
  ...props
}: T) => {
  if (!_wordWrap) {
    return { _className, ...props };
  }

  return {
    ...props,

    _className: ["overflow-hidden", "text-ellipsis", _className],
  };
};
