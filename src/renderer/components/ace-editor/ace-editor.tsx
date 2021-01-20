// Ace code editor - https://ace.c9.io
// Playground - https://ace.c9.io/build/kitchen-sink.html
import "./ace-editor.scss";

import React from "react";
import { observer } from "mobx-react";
import AceBuild, { Ace } from "ace-builds";
import { autobind, cssNames, noop } from "../../utils";

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
};

@observer
export class AceEditor extends React.Component<Props, State> {
  static defaultProps = defaultProps as object;

  private editor: Ace.Editor;
  private elem: HTMLElement;

  constructor(props: Props) {
    super(props);
    require("ace-builds/src-noconflict/mode-yaml");
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

  @autobind()
  onCursorPosChange() {
    const { onCursorPosChange } = this.props;

    if (onCursorPosChange) {
      onCursorPosChange(this.editor.getCursorPosition());
    }
  }

  @autobind()
  onChange(delta: Ace.Delta) {
    const { onChange } = this.props;

    if (onChange) {
      onChange(this.getValue(), delta);
    }
  }

  render() {
    const { className, hidden } = this.props;

    return (
      <div className={cssNames("AceEditor", className, { hidden })}>
        <div className="editor" ref={e => this.elem = e}/>
      </div>
    );
  }
}
