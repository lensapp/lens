import classnames from "classnames";

export type ClassName = classnames.Argument;

declare global {
  interface ElementProps {
    _className?: ClassName;
  }
}

export const classNameModification = <T extends ElementProps>({ _className, ...props }: T) => {
  const classNameString = classnames(_className);

  return {
    ...props,
    ...(classNameString ? { className: classNameString } : {}),
  };
};
