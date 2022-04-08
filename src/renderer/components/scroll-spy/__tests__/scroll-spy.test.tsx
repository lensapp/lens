/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import { ScrollSpy } from "../scroll-spy";
import { RecursiveTreeView } from "../../tree-view";

const observe = jest.fn();

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    observe,
    unobserve: jest.fn(),
  })),
});

describe("<ScrollSpy/>", () => {
  it("renders w/o errors", () => {
    const { container } = render((
      <ScrollSpy
        htmlFor=""
        render={() => (
          <div>
            <section id="application">
              <h1>Application</h1>
            </section>
          </div>
        )}
      />
    ));

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("calls intersection observer", () => {
    render((
      <ScrollSpy
        htmlFor=""
        render={() => (
          <div>
            <section id="application">
              <h1>Application</h1>
            </section>
          </div>
        )}
      />
    ));

    expect(observe).toHaveBeenCalled();
  });

  it("renders dataTree component", async () => {
    const { queryByTestId } = render((
      <ScrollSpy
        htmlFor=""
        render={dataTree => (
          <div>
            <nav>
              <RecursiveTreeView data={dataTree}/>
            </nav>
            <section id="application">
              <h1>Application</h1>
            </section>
          </div>
        )}
      />
    ));

    await waitFor(() => {
      expect(queryByTestId("TreeView")).toBeInTheDocument();
    });
  });

  it("throws if no sections founded", () => {
    // Prevent writing to stderr during this render.
    const err = console.error;

    console.error = jest.fn();

    expect(() => render((
      <ScrollSpy
        htmlFor=""
        render={() => (
          <div>
            Content
          </div>
        )}
      />
    ))).toThrow();

    // Restore writing to stderr.
    console.error = err;
  });
});


describe("<TreeView/> dataTree inside <ScrollSpy/>", () => {
  it("contains links to all sections", async () => {
    const { queryByTitle } = render((
      <ScrollSpy
        htmlFor=""
        render={dataTree => (
          <div>
            <nav>
              <RecursiveTreeView data={dataTree}/>
            </nav>
            <section id="application">
              <h1>Application</h1>
              <section id="appearance">
                <h2>Appearance</h2>
              </section>
              <section id="theme">
                <h2>Theme</h2>
                <div>description</div>
              </section>
            </section>
          </div>
        )}
      />
    ));

    await waitFor(() => {
      expect(queryByTitle("Application")).toBeInTheDocument();
      expect(queryByTitle("Appearance")).toBeInTheDocument();
      expect(queryByTitle("Theme")).toBeInTheDocument();
    });
  });

  it("not showing links to sections without id", async () => {
    const { queryByTitle } = render((
      <ScrollSpy
        htmlFor=""
        render={dataTree => (
          <div>
            <nav>
              <RecursiveTreeView data={dataTree}/>
            </nav>
            <section id="application">
              <h1>Application</h1>
              <section>
                <h2>Kubectl</h2>
              </section>
              <section id="appearance">
                <h2>Appearance</h2>
              </section>
            </section>
          </div>
        )}
      />
    ));

    await waitFor(() => {
      expect(queryByTitle("Application")).toBeInTheDocument();
      expect(queryByTitle("Appearance")).toBeInTheDocument();
      expect(queryByTitle("Kubectl")).not.toBeInTheDocument();
    });
  });

  it("expands parent sections", async () => {
    const { queryByTitle } = render((
      <ScrollSpy
        htmlFor=""
        render={dataTree => (
          <div>
            <nav>
              <RecursiveTreeView data={dataTree}/>
            </nav>
            <section id="application">
              <h1>Application</h1>
              <section id="appearance">
                <h2>Appearance</h2>
              </section>
              <section id="theme">
                <h2>Theme</h2>
                <div>description</div>
              </section>
            </section>
            <section id="Kubernetes">
              <h1>Kubernetes</h1>
              <section id="kubectl">
                <h2>Kubectl</h2>
              </section>
            </section>
          </div>
        )}
      />
    ));

    await waitFor(() => {
      expect(queryByTitle("Application")).toHaveAttribute("aria-expanded");
      expect(queryByTitle("Kubernetes")).toHaveAttribute("aria-expanded");
    });
  });

  it("skips sections without headings", async () => {
    const { queryByTitle } = render((
      <ScrollSpy
        htmlFor=""
        render={dataTree => (
          <div>
            <nav>
              <RecursiveTreeView data={dataTree}/>
            </nav>
            <section id="application">
              <h1>Application</h1>
              <section id="appearance">
                <p>Appearance</p>
              </section>
              <section id="theme">
                <h2>Theme</h2>
              </section>
            </section>
          </div>
        )}
      />
    ));

    await waitFor(() => {
      expect(queryByTitle("Application")).toBeInTheDocument();
      expect(queryByTitle("appearance")).not.toBeInTheDocument();
      expect(queryByTitle("Appearance")).not.toBeInTheDocument();
    });
  });
});
