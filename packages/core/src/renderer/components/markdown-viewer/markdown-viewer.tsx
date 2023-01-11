/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Wrapper Component with marked plugin in its core
// Source: https://www.npmjs.com/package/marked
import "./markdown-viewer.scss";

import React, { Component } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { cssNames } from "../../utils";

DOMPurify.addHook("afterSanitizeAttributes", function (node) {
  // Set all elements owning target to target=_blank
  if ("target" in node) {
    node.setAttribute("target", "_blank");
  }
});

export interface MarkdownViewerProps extends OptionalProps {
  markdown: string;
}

export interface OptionalProps {
  className?: string;
}

export class MarkdownViewer extends Component<MarkdownViewerProps> {
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
