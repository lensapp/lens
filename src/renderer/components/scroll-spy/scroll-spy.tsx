import React, { useEffect, useRef, useState } from "react";
import { useMutationObserver } from "../../hooks";
import { NavigationTree } from "../tree-view";

interface Props extends React.DOMAttributes<HTMLElement> {
  render: (data: NavigationTree[]) => JSX.Element
  rootMargin?: string // https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#creating_an_intersection_observer
}

ScrollSpy.defaultProps = {
  // Shrinking root area from the bottom
  // Allows to fire observer event only if target scrolled up to top of the page)
  rootMargin: "0px 0px -85%"
};

export function ScrollSpy(props: Props) {
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
        children: getNavigation(section)
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
      threshold: [0],
      rootMargin: props.rootMargin,
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
      {props.render(tree)}
    </div>
  );
}

