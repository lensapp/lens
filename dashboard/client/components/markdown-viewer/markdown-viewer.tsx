// Wrapper Component with marked plugin in its core
// Source: https://www.npmjs.com/package/marked
import "./markdown-viewer.scss";

import React, { Component } from "react";
import marked from "marked";
import DOMPurify from "dompurify";
import { cssNames } from "../../utils";
import { themeStore } from "../../theme.store";

DOMPurify.addHook('afterSanitizeAttributes', function (node) {
  // Set all elements owning target to target=_blank
  if ('target' in node as any as HTMLElement) {
    node.setAttribute('target', '_blank');
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
        className={cssNames("MarkDownViewer", className, themeStore.activeTheme.type)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
}