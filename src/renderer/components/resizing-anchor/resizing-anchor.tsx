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
  onStart?: (data: ResizeStartEvent) => void;
  onDrag?: (data: ResizeDragEvent) => void;
  onEnd?: (data: ResizeEndEvent) => void;
}

interface InitialPosition {
  initX: number;
  initY: number;
}

interface CurrentPosition {
  pageX: number;
  pageY: number;
}

interface MovementData {
  movementX: number;
  movementY: number;
}

export type ResizeStartEvent = InitialPosition
export type ResizeDragEvent = InitialPosition & CurrentPosition & MovementData
export type ResizeEndEvent = InitialPosition & CurrentPosition

function calculateMovement(from: CurrentPosition, to: CurrentPosition): MovementData {
  return {
    movementX: from.pageX - to.pageX,
    movementY: from.pageY - to.pageY,
  }
}

const defaultProps: Partial<Props> = {
  onStart: noop,
  onDrag: noop,
  onEnd: noop,
  disabled: false,
  placement: ResizeSide.LEADING,
}

export class ResizingAnchor extends React.PureComponent<Props> {
  @observable startingPosition?: ResizeStartEvent
  @observable lastEvent?: MouseEvent

  static defaultProps = defaultProps
  static IS_RESIZING = "resizing"

  constructor(props: Props) {
    super(props)
  }

  componentWillUnmount() {
    document.removeEventListener("mousemove", this.onDrag)
    document.removeEventListener("mouseup", this.onDragEnd)
  }

  @action
  onDragInit = ({ pageX, pageY, buttons }: React.MouseEvent<any>) => {
    const { onStart } = this.props

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

    onStart(this.startingPosition)
  }

  onDrag = _.throttle((event: MouseEvent) => {
    const { onDrag } = this.props
    const { initX, initY } = this.startingPosition
    const { pageX, pageY } = event
    const { movementX, movementY } = calculateMovement(this.lastEvent ?? event, event)

    onDrag({ movementX, movementY, pageX, pageY, initY, initX })
    this.lastEvent = event
  }, 100)

  @action
  onDragEnd = (event: MouseEvent) => {
    const { onEnd } = this.props
    const { initX, initY } = this.startingPosition
    const { pageX, pageY } = event

    onEnd(({ initX, initY, pageX, pageY }))
    document.removeEventListener("mousemove", this.onDrag)
    document.removeEventListener("mouseup", this.onDragEnd)
    document.body.classList.remove(ResizingAnchor.IS_RESIZING)
  }

  render() {
    const { disabled, direction, placement } = this.props
    return <div className={cssNames("ResizingAnchor", direction, placement, { disabled })} onMouseDown={this.onDragInit} />
  }
}
