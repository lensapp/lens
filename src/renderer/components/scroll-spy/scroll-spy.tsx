import React, { useEffect, useState } from "react";
import { NavigationTree } from "../tree-view";

interface Props extends React.DOMAttributes<any> {
  render: (data: NavigationTree[]) => any
}

export function ScrollSpy(props: Props) {
  const [tree, setTree] = useState<NavigationTree[]>([]);

  const updateNavigation = () => {
    const firstSection = document.querySelector("section");

    if (!firstSection) {
      throw new Error("No <section/> tag founded! Content should be placed inside <section></section> elements to activate navigation.");
    }

    setTree([
      ...tree,
      ...getNavigation(firstSection.parentElement)
    ]);
  };

  const getNavigation = (element: Element) => {
    const sections = element.querySelectorAll(":scope > section"); // Searching only direct children of an element. Impossible without :scope
    const children: NavigationTree[] = [];

    sections.forEach(section => {
      const key = section.getAttribute("id");
      const label = section.querySelector(":first-child").textContent;

      if (!label || !key) {
        return;
      }

      children.push({
        key,
        label,
        nodes: getNavigation(section)
      });
    });

    return children;
  };

  useEffect(() => {
    updateNavigation();
    // element.current.addEventListener("scroll", updateActive);
    // TODO: Attach on dom change event
  }, []);

  return (
    <div className="ScrollSpy">
      {props.render(tree)}
    </div>
  );
}
