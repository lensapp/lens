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

// Ace code editor - https://ace.c9.io
// Playground - https://ace.c9.io/build/kitchen-sink.html
import "./ace-editor.scss";

import React from "react";
import { observer } from "mobx-react";
import AceBuild, { Ace } from "ace-builds";
import { boundMethod, cssNames, noop } from "../../utils";

interface Props extends Partial<Ace.EditorOptions> {
  className?: string;
  autoFocus?: boolean;
  hidden?: boolean;
  cursorPos?: Ace.Point;
  onFocus?(evt: FocusEvent, value: string): void;
  onBlur?(evt: FocusEvent, value: string): void;
  onChange?(value: string, delta: Ace.Delta): void;
  onCursorPosChange?(point: Ace.Point): void;
}

interface State {
  ready?: boolean;
}

const defaultProps: Partial<Props> = {
  value: "",
  mode: "yaml",
  tabSize: 2,
  showGutter: true, // line-numbers
  foldStyle: "markbegin",
  printMargin: false,
  useWorker: false,
  onBlur: noop,
  onFocus: noop,
  cursorPos: { row: 0, column: 0 },
};

@observer
export class AceEditor extends React.Component<Props, State> {
  static defaultProps = defaultProps as object;

  private editor: Ace.Editor;
  private elem: HTMLElement;

  constructor(props: Props) {
    super(props);
    require("ace-builds/src-noconflict/mode-yaml");
    require("ace-builds/src-noconflict/mode-json");
    require("ace-builds/src-noconflict/theme-terminal");
    require("ace-builds/src-noconflict/ext-searchbox");
  }

  async componentDidMount() {
    const {
      mode, autoFocus, className, hidden, cursorPos,
      onBlur, onFocus, onChange, onCursorPosChange, children,
      ...options
    } = this.props;

    // setup editor
    this.editor = AceBuild.edit(this.elem, options);
    this.setTheme("terminal");
    this.setMode(mode);
    this.setCursorPos(cursorPos);

    // bind events
    this.editor.on("blur", (evt: any) => onBlur(evt, this.getValue()));
    this.editor.on("focus", (evt: any) => onFocus(evt, this.getValue()));
    this.editor.on("change", this.onChange);
    this.editor.selection.on("changeCursor", this.onCursorPosChange);

    if (autoFocus) {
      this.focus();
    }
  }

  componentDidUpdate() {
    if (!this.editor) return;
    const { value, cursorPos } = this.props;

    if (value !== this.getValue()) {
      this.editor.setValue(value);
      this.editor.clearSelection();
      this.setCursorPos(cursorPos || this.editor.getCursorPosition());
    }
  }

  componentWillUnmount() {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  resize() {
    if (this.editor) {
      this.editor.resize();
    }
  }

  focus() {
    if (this.editor) {
      this.editor.focus();
    }
  }

  getValue() {
    return this.editor.getValue();
  }

  setValue(value: string, cursorPos?: number) {
    return this.editor.setValue(value, cursorPos);
  }

  async setMode(mode: string) {
    this.editor.session.setMode(`ace/mode/${mode}`);
  }

  async setTheme(theme: string) {
    this.editor.setTheme(`ace/theme/${theme}`);
  }

  setCursorPos(pos: Ace.Point) {
    if (!pos) return;
    const { row, column } = pos;

    this.editor.moveCursorToPosition(pos);
    requestAnimationFrame(() => {
      this.editor.gotoLine(row + 1, column, false);
    });
  }

  @boundMethod
  onCursorPosChange() {
    const { onCursorPosChange } = this.props;

    if (onCursorPosChange) {
      onCursorPosChange(this.editor.getCursorPosition());
    }
  }

  @boundMethod
  onChange(delta: Ace.Delta) {
    const { onChange } = this.props;

    if (onChange) {
      onChange(this.getValue(), delta);
    }
  }

  render() {
    const { className, hidden, children } = this.props;

    return (
      <div className={cssNames("AceEditor", className, { hidden })}>
        <div className="editor" ref={e => this.elem = e}/>
        {children}
      </div>
    );
  }
}
