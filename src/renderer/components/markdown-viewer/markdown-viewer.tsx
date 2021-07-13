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

// Wrapper Component with marked plugin in its core
// Source: https://www.npmjs.com/package/marked
import "./markdown-viewer.scss";

import React, { Component } from "react";
import marked from "marked";
import DOMPurify from "dompurify";
import { cssNames } from "../../utils";

DOMPurify.addHook("afterSanitizeAttributes", function (node) {
  // Set all elements owning target to target=_blank
  if ("target" in node as any as HTMLElement) {
    node.setAttribute("target", "_blank");
  }
});

interface Props extends OptionalProps {
  markdown: string;
}

interface OptionalProps {
  className?: string;
}

export class MarkdownViewer extends Component<Props> {
  render() {
    const { className, markdown } = this.props;
    const html = DOMPurify.sanitize(marked(markdown));

    return (
      <div
        className={cssNames("MarkDownViewer", className)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
}
