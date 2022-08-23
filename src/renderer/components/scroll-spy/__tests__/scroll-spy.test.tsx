/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, screen, waitFor } from "@testing-library/react";
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
    render((
      <ScrollSpy
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

    expect(await screen.findByTestId("TreeView")).toBeInTheDocument();
  });

  it("throws if no sections founded", () => {
    // Prevent writing to stderr during this render.
    const err = console.error;

    console.error = jest.fn();

    expect(() => render((
      <ScrollSpy
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
    render((
      <ScrollSpy
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

    expect(await screen.findByTitle("Application")).toBeInTheDocument();
    expect(await screen.findByTitle("Appearance")).toBeInTheDocument();
    expect(await screen.findByTitle("Theme")).toBeInTheDocument();
  });

  it("not showing links to sections without id", async () => {
    const { queryByTitle } = render((
      <ScrollSpy
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

    expect(await screen.findByTitle("Application")).toBeInTheDocument();
    expect(await screen.findByTitle("Appearance")).toBeInTheDocument();

    await waitFor(() => {
      expect(queryByTitle("Kubectl")).not.toBeInTheDocument();
    });
  });

  it("expands parent sections", async () => {
    render((
      <ScrollSpy
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

    expect(await screen.findByTitle("Application")).toHaveAttribute("aria-expanded");
    expect(await screen.findByTitle("Kubernetes")).toHaveAttribute("aria-expanded");
  });

  it("skips sections without headings", async () => {
    render((
      <ScrollSpy
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

    expect(await screen.findByTitle("Application")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTitle("appearance")).not.toBeInTheDocument();
      expect(screen.queryByTitle("Appearance")).not.toBeInTheDocument();
    });
  });
});
