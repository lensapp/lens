// Plugin for drawing stripe bars on top of any timeseries barchart
// Based on cover DIV element with repeating-linear-gradient style

import { ChartPoint, default as ChartJS } from "chart.js";
import moment, { Moment } from "moment";
import get from "lodash/get";

const defaultOptions = {
  interval: 61,
  stripeMinutes: 10,
  stripeColor: "#ffffff08",
}

export const ZebraStripes = {
  updated: null as Moment,  // timestamp which all stripe movements based on
  options: {},

  getOptions(chart: ChartJS) {
    return get(chart, "options.plugins.ZebraStripes");
  },

  getLastUpdate(chart: ChartJS) {
    const data = chart.data.datasets[0].data[0] as ChartPoint;
    return moment.unix(parseInt(data.x as string));
  },

  getStripesElem(chart: ChartJS) {
    return chart.canvas.parentElement.querySelector(".zebra-cover");
  },

  removeStripesElem(chart: ChartJS) {
    const elem = this.getStripesElem(chart);
    if (!elem) return;
    chart.canvas.parentElement.removeChild(elem);
  },

  renderStripes(chart: ChartJS) {
    if (!chart.data.datasets.length) return;
    const { interval, stripeMinutes, stripeColor } = this.options;
    const { top, left, bottom, right } = chart.chartArea;
    const step = (right - left) / interval;
    const stripeWidth = step * stripeMinutes;
    const cover = document.createElement("div");
    const styles = cover.style;

    if (this.getStripesElem(chart)) return;

    cover.className = "zebra-cover";
    styles.width = right - left + "px";
    styles.left = left + "px";
    styles.top = top + "px";
    styles.height = bottom - top + "px";
    styles.backgroundImage = `
      repeating-linear-gradient(to right, ${stripeColor} 0px, ${stripeColor} ${stripeWidth}px,
      transparent ${stripeWidth}px, transparent ${stripeWidth * 2 + step}px)
     `;
    chart.canvas.parentElement.appendChild(cover);
  },

  afterInit(chart: ChartJS) {
    if (!chart.data.datasets.length) return;
    this.options = {
      ...defaultOptions,
      ...this.getOptions(chart)
    }
    this.updated = this.getLastUpdate(chart);
  },

  afterUpdate(chart: ChartJS) {
    this.renderStripes(chart);
  },

  resize(chart: ChartJS) {
    this.removeStripesElem(chart);
  },

  afterDatasetUpdate(chart: ChartJS): void {
    if (!this.updated) this.updated = this.getLastUpdate(chart);

    const { interval } = this.options;
    const { left, right } = chart.chartArea;
    const step = (right - left) / interval;
    const diff = moment(this.updated).diff(this.getLastUpdate(chart), "minutes");
    const minutes = Math.abs(diff);

    this.removeStripesElem(chart);
    this.renderStripes(chart);

    if (minutes > 0) {
      // Move position regarding to difference in time
      const cover = this.getStripesElem(chart);
      cover.style.backgroundPositionX = -step * minutes + "px";
    }
  }
}