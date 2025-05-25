import * as echarts from "echarts";
import { useEffect } from "react";
import { calculateCosts } from "./breakdown";

export default function TransactionGraph({ record }) {
  useEffect(() => {
    if (!record) return;

    const uniqueRecords = record.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.tellerid === item.tellerid)
    );

    const barDom = document.getElementById("transactions");
    let barChart = echarts.init(barDom);

    var chartSeriesNames = [];
    var chartSeriesValues = [];
    var dates = [];
    for (let i = 0; i < uniqueRecords.length; i++) {
      chartSeriesNames.push(uniqueRecords[i].name);
      chartSeriesValues.push(uniqueRecords[i].amount);

      // chartSeriesValues.push([uniqueRecords[i].date, uniqueRecords[i].amount]);
      dates.push(uniqueRecords[i].date);
    }

    let barOption = {
      yAxis: {
        type: "value",
        name: "($)",
      },
      xAxis: {
        type: "category",

        // data: chartSeriesNames,
        date: dates,
      },
      legend: { show: false },
      dataZoom: [
        {
          type: "inside",
          start: 80,
          end: 100,
        },
        {
          start: 80,
          end: 100,
        },
        {
          show: true,
          yAxisIndex: 0,
          filterMode: "filter",
          width: 30,
          height: "80%",
          showDataShadow: false,
          left: "93%",
        },
      ],

      tooltip: {
        trigger: "axis",
        formatter: (params) => {
          return params
            .map((param) => {
              const seriesName = chartSeriesNames[param.dataIndex];
              return `${seriesName}: ${param.value}`;
            })
            .join("<br>");
        },
      },

      series: [
        {
          data: chartSeriesValues,

          type: "bar",
          itemStyle: {
            normal: {
              color: function (params) {
                const colors =
                  params.value < 0
                    ? ["#FFC080", "#E2786F", "#C51077", "#8B0A1A"]
                    : ["#34C759"];

                // Re
                return colors[params.dataIndex % colors.length];
              },
            },
          },
        },
      ],
    };
    barChart.setOption(barOption);
  }, [record]);

  return (
    <>
      <div id="transactions" style={{ width: "100%", height: "400px" }}></div>
    </>
  );
}
