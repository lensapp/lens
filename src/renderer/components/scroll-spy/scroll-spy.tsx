/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observer } from "mobx-react";
import React, { useEffect, useRef, useState } from "react";
import { useMutationObserver } from "../../hooks";
import type { NavigationTree } from "../tree-view";

export interface ScrollSpyProps extends React.DOMAttributes<HTMLElement> {
  render: (data: NavigationTree[]) => JSX.Element;
  htmlFor?: string; // Id of the element to put observers on
  rootMargin?: string; // https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#creating_an_intersection_observer
}

export const ScrollSpy = observer(({ render, htmlFor, rootMargin = "0px 0px -100% 0px" }: ScrollSpyProps) => {
  const parent = useRef<HTMLDivElement>(null);
  const sections = useRef<NodeListOf<HTMLElement>>();
  const [tree, setTree] = useState<NavigationTree[]>([]);
  const [activeElementId, setActiveElementId] = useState("");

  const setSections = (): NodeListOf<HTMLElement> => {
    sections.current = parent.current?.querySelectorAll("section");

    if (!sections.current?.length) {
      throw new Error("No <section/> tag founded! Content should be placed inside <section></section> elements to activate navigation.");
    }

    return sections.current;
  };

  const getSectionsParentElement = () => {
    return sections.current?.[0].parentElement;
  };

  const updateNavigation = () => {
    setTree(getNavigation(getSectionsParentElement()));
  };

  const getNavigation = (element: Element | null | undefined): NavigationTree[] => {
    if (!element) {
      return [];
    }

    const sections = element.querySelectorAll(":scope > section"); // Searching only direct children of an element. Impossible without :scope
    const children: NavigationTree[] = [];

    sections.forEach(section => {
      const id = section.getAttribute("id");
      const parentId = section.parentElement?.id;
      const name = section.querySelector("h1, h2, h3, h4, h5, h6")?.textContent;
      const selected = id === activeElementId;

      if (!name || !id) {
        return;
      }

      children.push({
        id,
        parentId,
        name,
        selected,
        children: getNavigation(section),
      });
    });

    return children;
  };

  const handleIntersect = ([entry]: IntersectionObserverEntry[]) => {
    const closest = entry.target.closest("section[id]");

    if (entry.isIntersecting && closest) {
      setActiveElementId(closest.id);
    }
  };

  const observeSections = (list: NodeListOf<HTMLElement>) => {
    const options: IntersectionObserverInit = {
      root: (htmlFor && document.getElementById(htmlFor)) || getSectionsParentElement(),
      rootMargin,
    };

    list.forEach((section) => {
      const observer = new IntersectionObserver(handleIntersect, options);
      const target = section.querySelector("section") || section;

      observer.observe(target);
    });
  };

  useEffect(() => {
    const list = setSections();

    observeSections(list);
  }, [parent.current]);

  useEffect(() => {
    updateNavigation();
  }, [activeElementId]);

  useMutationObserver(getSectionsParentElement(), updateNavigation);

  return (
    <div className="ScrollSpy" ref={parent}>
      {render(tree)}
    </div>
  );
});
