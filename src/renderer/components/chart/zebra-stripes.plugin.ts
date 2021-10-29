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

// Plugin for drawing stripe bars on top of any timeseries barchart
// Based on cover DIV element with repeating-linear-gradient style

import type ChartJS from "chart.js";
import moment, { Moment } from "moment";
import get from "lodash/get";

const defaultOptions = {
  stripeColor: "#ffffff08",
};

export const ZebraStripes = {
  updated: null as Moment,  // timestamp which all stripe movements based on
  options: {},

  getOptions(chart: ChartJS) {
    return get(chart, "options.plugins.ZebraStripes");
  },

  getLastUpdate(chart: ChartJS) {
    const data = chart.data.datasets[0].data[0] as ChartJS.ChartPoint;

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

  updateOptions(chart: ChartJS) {
    this.options = {
      ...defaultOptions,
      ...this.getOptions(chart),
    };
  },

  getStripeMinutes() {
    return this.options.interval < 10 ? 0 : 10;
  },

  renderStripes(chart: ChartJS) {
    if (!chart.data.datasets.length) return;
    const { interval, stripeColor } = this.options;
    const { top, left, bottom, right } = chart.chartArea;
    const step = (right - left) / interval;
    const stripeWidth = step * this.getStripeMinutes();
    const cover = document.createElement("div");
    const styles = cover.style;

    if (this.getStripesElem(chart)) return;

    cover.className = "zebra-cover";
    styles.width = `${right - left}px`;
    styles.left = `${left}px`;
    styles.top = `${top}px`;
    styles.height = `${bottom - top}px`;
    styles.backgroundImage = `
      repeating-linear-gradient(to right, ${stripeColor} 0px, ${stripeColor} ${stripeWidth}px,
      transparent ${stripeWidth}px, transparent ${stripeWidth * 2 + step}px)
     `;
    chart.canvas.parentElement.appendChild(cover);
  },

  afterInit(chart: ChartJS) {
    if (!chart.data.datasets.length) return;
    this.updateOptions(chart);
    this.updated = this.getLastUpdate(chart);
  },

  afterUpdate(chart: ChartJS) {
    this.updateOptions(chart);
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

      cover.style.backgroundPositionX = `${-step * minutes}px`;
    }
  },
};
