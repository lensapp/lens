import React, { useEffect, useState } from "react";
import { NavigationTree } from "../tree-view";

interface Props extends React.DOMAttributes<any> {
  render: (data: NavigationTree[]) => any
}

export function ScrollSpy(props: Props) {
  const [tree, setTree] = useState<NavigationTree[]>([]);
  const [activeElementId, setActiveElementId] = useState("");

  const getContentParentElement = () => {
    const firstSection = document.querySelector("section");

    if (!firstSection) {
      throw new Error("No <section/> tag founded! Content should be placed inside <section></section> elements to activate navigation.");
    }

    return firstSection.parentElement;
  };

  const updateNavigation = () => {
    setTree([
      ...tree,
      ...getNavigation(getContentParentElement())
    ]);
  };

  const getNavigation = (element: Element) => {
    const sections = element.querySelectorAll(":scope > section"); // Searching only direct children of an element. Impossible without :scope
    const children: NavigationTree[] = [];

    sections.forEach(section => {
      const id = section.getAttribute("id");
      const name = section.querySelector(":first-child").textContent;

      if (!name || !id) {
        return;
      }

      children.push({
        id,
        name,
        children: getNavigation(section)
      });
    });

    return children;
  };

  const handleIntersect = (entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting) {
      setActiveElementId(entries[0].target.id);
    }
  };

  const observeSections = () => {
    const sections = getContentParentElement().querySelectorAll("section");
    const options = {
      rootMargin: "-50% 0px"
    };

    sections.forEach((section) => {
      const observer = new IntersectionObserver(handleIntersect, options);

      observer.observe(section);
    });
  };

  useEffect(() => {
    updateNavigation();
    observeSections();
    // element.current.addEventListener("scroll", updateActive);
    // TODO: Attach on dom change event
  }, []);

  return (
    <div className="ScrollSpy">
      {props.render(tree)}
    </div>
  );
}
