import React, { HTMLAttributes } from "react";
import { pipeline } from "@ogre-tools/fp";
import { flexParentModification } from "./prop-modifications/flex/flex-parent";
import { classNameModification } from "./prop-modifications/class-names/class-names";
import { vanillaClassNameAdapterModification } from "./prop-modifications/class-names/vanilla-class-name-adapter";
import { wordWrapModification } from "./prop-modifications/word-wrap/word-wrap";

export const ElementFor =
  <T extends HTMLElement, Y extends HTMLAttributes<T>>(TagName: React.ElementType) =>
  (props: React.DetailedHTMLProps<Y, T> & ElementProps) => {
    const modifiedProps = pipeline(
      props,
      vanillaClassNameAdapterModification,
      flexParentModification,
      wordWrapModification,
      classNameModification,
    );

    return <TagName {...modifiedProps} />;
  };
