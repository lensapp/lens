// Ace code editor - https://ace.c9.io
// Playground - https://ace.c9.io/build/kitchen-sink.html
import "./ace-editor.scss"

import * as React from "react"
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Ace } from "ace-builds"
import { autobind, cssNames } from "../../utils";
import { Spinner } from "../spinner";
import { themeStore } from "../../theme.store";

interface Props extends Partial<Ace.EditorOptions> {
  className?: string;
  autoFocus?: boolean;
  hidden?: boolean;
  cursorPos?: Ace.Point;
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
  foldStyle: "manual",
  printMargin: false,
  useWorker: false,
};

@observer
export class AceEditor extends React.Component<Props, State> {
  static defaultProps = defaultProps as object;

  private editor: Ace.Editor;
  private elem: HTMLElement;

  @observable ready = false;

  async loadEditor() {
    return await import(
      /* webpackChunkName: "ace" */
      "ace-builds"
    );
  }

  loadTheme(theme: string) {
    return import(
      /* webpackChunkName: "ace/[request]" */
      `ace-builds/src-min-noconflict/theme-${theme}`
    );
  }

  loadExtension(ext: string) {
    return import(
      /* webpackChunkName: "ace/[request]" */
      `ace-builds/src-min-noconflict/ext-${ext}`
    );
  }

  loadMode(mode: string) {
    return import(
      /* webpackChunkName: "ace/[request]" */
      `ace-builds/src-min-noconflict/mode-${mode}`
    )
  }

  get theme() {
    return themeStore.activeTheme.type == "light"
      ? "dreamweaver" : "terminal";
  }

  async componentDidMount() {
    const {
      mode, autoFocus, className, hidden, cursorPos,
      onChange, onCursorPosChange, children,
      ...options
    } = this.props;

    // load ace-editor, theme and mode
    const ace = await this.loadEditor();
    await Promise.all([
      this.loadTheme(this.theme),
      this.loadMode(mode)
    ]);

    // setup editor
    this.editor = ace.edit(this.elem, options);
    this.setTheme(this.theme);
    this.setMode(mode);
    this.setCursorPos(cursorPos);

    // bind events
    this.editor.on("change", this.onChange);
    this.editor.selection.on("changeCursor", this.onCursorPosChange);

    // load extensions
    this.loadExtension("searchbox");

    if (autoFocus) this.focus();
    this.ready = true;
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
    return this.editor.getValue()
  }

  setValue(value: string, cursorPos?: number) {
    return this.editor.setValue(value, cursorPos);
  }

  async setMode(mode: string) {
    await this.loadMode(mode);
    this.editor.session.setMode(`ace/mode/${mode}`);
  }

  async setTheme(theme: string) {
    await this.loadTheme(theme);
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
    const themeType = themeStore.activeTheme.type;
    return (
      <div className={cssNames("AceEditor", className, { hidden }, themeType)}>
        <div className="editor" ref={e => this.elem = e}/>
        {!this.ready && <Spinner center/>}
      </div>
    )
  }
}