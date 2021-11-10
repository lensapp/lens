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
    const { container } = render(<ScrollSpy render={() => (
      <div>
        <section id="application">
          <h1>Application</h1>
        </section>
      </div>
    )}/>);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("calls intersection observer", () => {
    render(<ScrollSpy render={() => (
      <div>
        <section id="application">
          <h1>Application</h1>
        </section>
      </div>
    )}/>);

    expect(observe).toHaveBeenCalled();
  });

  it("renders dataTree component", async () => {
    const { queryByTestId } = render(<ScrollSpy render={dataTree => (
      <div>
        <nav>
          <RecursiveTreeView data={dataTree}/>
        </nav>
        <section id="application">
          <h1>Application</h1>
        </section>
      </div>
    )}/>);

    await waitFor(() => {
      expect(queryByTestId("TreeView")).toBeInTheDocument();
    });
  });

  it("throws if no sections founded", () => {
    expect(() => render(<ScrollSpy render={() => (
      <div>
        Content
      </div>
    )}/>)).toThrow();
  });
});


describe("<TreeView/> dataTree inside <ScrollSpy/>", () => {
  it("contains links to all sections", async () => {
    const { queryByTitle } = render(<ScrollSpy render={dataTree => (
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
    )}/>);

    await waitFor(() => {
      expect(queryByTitle("Application")).toBeInTheDocument();
      expect(queryByTitle("Appearance")).toBeInTheDocument();
      expect(queryByTitle("Theme")).toBeInTheDocument();
    });
  });

  it("not showing links to sections without id", async () => {
    const { queryByTitle } = render(<ScrollSpy render={dataTree => (
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
    )}/>);

    await waitFor(() => {
      expect(queryByTitle("Application")).toBeInTheDocument();
      expect(queryByTitle("Appearance")).toBeInTheDocument();
      expect(queryByTitle("Kubectl")).not.toBeInTheDocument();
    });
  });

  it("expands parent sections", async () => {
    const { queryByTitle } = render(<ScrollSpy render={dataTree => (
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
    )}/>);

    await waitFor(() => {
      expect(queryByTitle("Application")).toHaveAttribute("aria-expanded");
      expect(queryByTitle("Kubernetes")).toHaveAttribute("aria-expanded");
    });
  });

  it("skips sections without headings", async () => {
    const { queryByTitle } = render(<ScrollSpy render={dataTree => (
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
    )}/>);

    await waitFor(() => {
      expect(queryByTitle("Application")).toBeInTheDocument();
      expect(queryByTitle("appearance")).not.toBeInTheDocument();
      expect(queryByTitle("Appearance")).not.toBeInTheDocument();
    });
  });
});
