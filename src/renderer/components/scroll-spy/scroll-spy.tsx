/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { observer } from "mobx-react";
import React, { useEffect, useRef, useState } from "react";
import { useMutationObserver } from "../../hooks";
import type { NavigationTree } from "../tree-view";

interface Props extends React.DOMAttributes<HTMLElement> {
  render: (data: NavigationTree[]) => JSX.Element
  htmlFor?: string // Id of the element to put observers on
  rootMargin?: string // https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#creating_an_intersection_observer
}

export const ScrollSpy = observer(({ render, htmlFor, rootMargin = "0px 0px -100% 0px" }: Props) => {
  const parent = useRef<HTMLDivElement>();
  const sections = useRef<NodeListOf<HTMLElement>>();
  const [tree, setTree] = useState<NavigationTree[]>([]);
  const [activeElementId, setActiveElementId] = useState("");

  const setSections = () => {
    sections.current = parent.current.querySelectorAll("section");

    if (!sections.current.length) {
      throw new Error("No <section/> tag founded! Content should be placed inside <section></section> elements to activate navigation.");
    }
  };

  const getSectionsParentElement = () => {
    return sections.current?.[0].parentElement;
  };

  const updateNavigation = () => {
    setTree(getNavigation(getSectionsParentElement()));
  };

  const getNavigation = (element: Element) => {
    const sections = element.querySelectorAll(":scope > section"); // Searching only direct children of an element. Impossible without :scope
    const children: NavigationTree[] = [];

    sections.forEach(section => {
      const id = section.getAttribute("id");
      const parentId = section.parentElement.id;
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
    if (entry.isIntersecting) {
      setActiveElementId(entry.target.closest("section[id]").id);
    }
  };

  const observeSections = () => {
    const options: IntersectionObserverInit = {
      root: document.getElementById(htmlFor) || getSectionsParentElement(),
      rootMargin,
    };

    sections.current.forEach((section) => {
      const observer = new IntersectionObserver(handleIntersect, options);
      const target = section.querySelector("section") || section;

      observer.observe(target);
    });
  };

  useEffect(() => {
    setSections();
    observeSections();
  }, []);

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
