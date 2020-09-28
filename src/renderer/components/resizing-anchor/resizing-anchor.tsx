import "./resizing-anchor.scss";
import React from "react";
import { cssNames, noop } from "../../utils";
import { action, computed, observable } from "mobx";
import _ from "lodash"

export enum ResizeDirection {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical",
}

/**
 * ResizeSide is for customizing where the area should be rendered.
 * That location is determined in conjunction with the `ResizeDirection` using the following table:
 *
 * +----------+------------+----------+
 * |          | HORIZONTAL | VERTICAL |
 * +----------+------------+----------+
 * |  LEADING | left       | top      |
 * +----------+------------+----------+
 * | TRAILING | right      | bottom   |
 * +----------+------------+----------+
 */
export enum ResizeSide {
  LEADING = "leading",
  TRAILING = "trailing",
}

interface Props {
  direction: ResizeDirection;
  disabled?: boolean;
  placement?: ResizeSide;
  onStart?: () => void;
  onDrag?: (data: ResizeEventData) => void;
  onEnd?: () => void;
}

export interface ResizeEventData {
  initX: number;
  initY: number;
  pageX: number;
  pageY: number;
  movementX: number;
  movementY: number;
}

const defaultProps: Partial<Props> = {
  onStart: noop,
  onDrag: noop,
  onEnd: noop,
  disabled: false,
  placement: ResizeSide.LEADING,
}

export class ResizingAnchor extends React.PureComponent<Props> {
  @observable startingPosition?: { initX: number, initY: number };
  @observable lastEvent?: MouseEvent

  @computed get firstDragEvent() {
    return this.lastEvent == null
  }

  static defaultProps = defaultProps
  static IS_RESIZING = "resizing"

  constructor(props: Props) {
    super(props);
  }

  componentWillUnmount() {
    document.removeEventListener("mousemove", this.onDrag);
    document.removeEventListener("mouseup", this.onDragEnd);
  }

  @action
  onDragInit = ({ pageX, pageY, buttons }: React.MouseEvent<any>) => {
    if (buttons !== 1) {
      return
    }

    document.addEventListener("mousemove", this.onDrag)
    document.addEventListener("mouseup", this.onDragEnd)
    document.body.classList.add(ResizingAnchor.IS_RESIZING)

    this.startingPosition = {
      initX: pageX,
      initY: pageY
    }
    this.lastEvent = undefined
  }

  calculateMovement = (event: MouseEvent) => {
    return {
      movementX: this.lastEvent.pageX - event.pageX,
      movementY: this.lastEvent.pageY - event.pageY
    }
  }

  onDrag = _.throttle((event: MouseEvent) => {
    const { onDrag, onStart } = this.props
    const { initX, initY } = this.startingPosition
    const { pageX, pageY } = event

    if (this.firstDragEvent) onStart()

    const { movementX, movementY } = this.firstDragEvent ? event : this.calculateMovement(event)
    onDrag({ movementX, movementY, pageX, pageY, initY, initX })

    this.lastEvent = event
  }, 100)

  @action
  onDragEnd = (event: MouseEvent) => {
    const { onEnd } = this.props;

    onEnd()
    document.removeEventListener("mousemove", this.onDrag);
    document.removeEventListener("mouseup", this.onDragEnd);
    document.body.classList.remove(ResizingAnchor.IS_RESIZING)
  }

  render() {
    const { disabled, direction, placement } = this.props
    return <div className={cssNames("ResizingAnchor", direction, placement, { disabled })} onMouseDown={this.onDragInit} />
  }
}
