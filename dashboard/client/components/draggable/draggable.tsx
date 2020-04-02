import "./draggable.scss";
import * as React from "react";
import { cssNames, IClassName, noop } from "../../utils";
import throttle from "lodash/throttle";

export interface DraggableEventHandler {
  (state: DraggableState): void;
}

interface Props {
  className?: IClassName;
  vertical?: boolean;
  horizontal?: boolean;
  onStart?: DraggableEventHandler;
  onEnter?: DraggableEventHandler;
  onEnd?: DraggableEventHandler;
}

export interface DraggableState {
  inited?: boolean;
  changed?: boolean;
  initX?: number;
  initY?: number;
  pageX?: number;
  pageY?: number;
  offsetX?: number;
  offsetY?: number;
}

const initState: DraggableState = {
  inited: false,
  changed: false,
  offsetX: 0,
  offsetY: 0,
};

export class Draggable extends React.PureComponent<Props, DraggableState> {
  public state = initState;

  static IS_DRAGGING = "dragging"

  static defaultProps: Props = {
    vertical: true,
    horizontal: true,
    onStart: noop,
    onEnter: noop,
    onEnd: noop,
  };

  constructor(props: Props) {
    super(props);
    document.addEventListener("mousemove", this.onDrag);
    document.addEventListener("mouseup", this.onDragEnd);
  }

  componentWillUnmount() {
    document.removeEventListener("mousemove", this.onDrag);
    document.removeEventListener("mouseup", this.onDragEnd);
  }

  onDragInit = (evt: React.MouseEvent<any>) => {
    document.body.classList.add(Draggable.IS_DRAGGING);
    const { pageX, pageY } = evt;
    this.setState({
      inited: true,
      initX: pageX,
      initY: pageY,
      pageX: pageX,
      pageY: pageY,
    })
  }

  onDrag = throttle((evt: MouseEvent) => {
    const { vertical, horizontal, onEnter, onStart } = this.props;
    const { inited, pageX, pageY } = this.state;
    const offsetX = pageX - evt.pageX;
    const offsetY = pageY - evt.pageY;
    let changed = false;
    if (horizontal && offsetX !== 0) changed = true;
    if (vertical && offsetY !== 0) changed = true;
    if (inited && changed) {
      const start = !this.state.changed;
      const state = Object.assign({}, this.state, {
        changed: true,
        pageX: evt.pageX,
        pageY: evt.pageY,
        offsetX: offsetX,
        offsetY: offsetY,
      });
      if (start) onStart(state);
      this.setState(state, () => onEnter(state));
    }
  }, 100)

  onDragEnd = (evt: MouseEvent) => {
    const { pageX, pageY } = evt;
    const { inited, changed, initX, initY } = this.state;
    if (inited) {
      document.body.classList.remove(Draggable.IS_DRAGGING);
      this.setState(initState, () => {
        if (!changed) return;
        const state = Object.assign({}, this.state, {
          offsetX: initX - pageX,
          offsetY: initY - pageY,
        });
        this.props.onEnd(state);
      });
    }
  }

  render() {
    const { className, children } = this.props;
    return (
      <div className={cssNames("Draggable", className)} onMouseDown={this.onDragInit}>
        {children}
      </div>
    );
  }
}