import type { ClassName } from "./class-names";

export const vanillaClassNameAdapterModification = <T extends ElementProps>({
  className,
  _className,
  ...props
}: T & { className?: string; _className?: ClassName }) => ({
  ...props,
  _className: [className, _className],
});
