import moment from "moment";
import { useState, useEffect } from "react";
import { useInterval } from "../../hooks";

type IMetricValues = [number, string][];
type IChartData = { x: number; y: string }[]

const defaultParams = {
  fetchInterval: 15,
  updateInterval: 5
}

export function useRealTimeMetrics(metrics: IMetricValues, chartData: IChartData, params = defaultParams) {
  const [index, setIndex] = useState(0);
  const { fetchInterval, updateInterval } = params;
  const rangeMetrics = metrics.slice(-updateInterval);
  const steps = fetchInterval / updateInterval;
  const data = [...chartData];

  useEffect(() => {
    setIndex(0);
  }, [metrics]);

  useInterval(() => {
    if (index < steps + 1) {
      setIndex(index + steps - 1);
    }
  }, updateInterval * 1000);

  if (data.length && metrics.length) {
    const lastTime = data[data.length - 1].x;
    const values = [];
    for (let i = 0; i < 3; i++) {
      values[i] = moment.unix(lastTime).add(i + 1, "m").unix();
    }
    data.push(
      { x: values[0], y: "0" },
      { x: values[1], y: parseFloat(rangeMetrics[index][1]).toFixed(3) },
      { x: values[2], y: "0" }
    );
  }
  return data;
}