import React, { useEffect, useRef, useState } from "react";
import { NavigationTree } from "../tree-view";

interface Props extends React.DOMAttributes<any> {
  render: (data: NavigationTree[]) => any
}

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

  const updateNavigation = () => {
    setTree([
      ...tree,
      ...getNavigation(sections.current[0].parentElement)
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
    const options: IntersectionObserverInit = {
      threshold: [0],
      rootMargin: "0px 0px -85%",
    };

    sections.current.forEach((section) => {
      const observer = new IntersectionObserver(handleIntersect, options);

      observer.observe(section);
    });
  };

  useEffect(() => {
    setSections();
    observeSections();
    updateNavigation();
    // TODO: Attach on dom change event
  }, []);

  console.log(activeElementId);

  return (
    <div className="ScrollSpy" ref={parent}>
      {props.render(tree)}
    </div>
  );
}
