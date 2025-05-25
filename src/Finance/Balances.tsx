import * as echarts from "echarts";
import { useEffect } from "react";
import { calculateCosts } from "./breakdown";

export default function BalanceGraph({ record }) {
  useEffect(() => {
    if (!record) return;
    const barDom = document.getElementById("balamce");
    let barChart = echarts.init(barDom);

    var chartSeriesNames = [];
    var chartSeriesValues = [];
    for (let i = 0; i < record.length; i++) {
      chartSeriesNames.push(record[i].name);
      chartSeriesValues.push(record[i].balance);
    }
    console.log(record);

    let barOption = {
      yAxis: {
        type: "value",
        name: "($)",
      },
      xAxis: {
        type: "category",
        data: chartSeriesNames,
      },
      legend: {},

      tooltip: {
        trigger: "axis",
      },

      series: [
        {
          data: chartSeriesValues,
          type: "bar",
        },
      ],
    };
    barChart.setOption(barOption);
  }, [record]);

  return (
    <>
      <div id="balamce" style={{ width: "100%", height: "400px" }}></div>
    </>
  );
}
