import * as echarts from "echarts";
import { useEffect } from "react";
import { calculateCosts } from "./breakdown";

export default function Overviewgraph({ timeframe, income, costs }) {
  useEffect(() => {
    if (!timeframe || !costs) return;
    const xaxis = Array.from({ length: timeframe + 1 }, (_, i) => i.toString());

    let incomedata = new Array(timeframe + 1).fill(0);
    let costseriesdata = new Array(timeframe + 1).fill(0);
    let netseries = new Array(timeframe + 1).fill(0);

    costseriesdata = new Array(timeframe + 1).fill(0);
    costseriesdata = calculateCosts(costseriesdata, timeframe, costs);
    console.log("INCOME", income);

    Object.keys(income).forEach((key) => {
      console.log(key);
      for (let i = 0; i < timeframe + 1; i++) {
        incomedata[i] = incomedata[i] + income[key] / 12;
      }
    });

    for (let i = 0; i < timeframe + 1; i++) {
      netseries[i] =
        incomedata[i] + costseriesdata[i] + (i > 0 ? netseries[i - 1] : 0);
    }

    let summedSeries = {
      name: "EBITDA",
      data: incomedata.map(function (item) {
        item = item.toFixed(2);
        return item;
      }),
      type: "line",
      areaStyle: { color: "none" },
      color: "blue",
    };
    let costseries = {
      name: "Costs",
      data: costseriesdata.map(function (item) {
        item = item.toFixed(2);
        return item;
      }),
      type: "line",
      areaStyle: { color: "none" },
      color: "orange",
    };

    const flectionPoint = netseries.findIndex((item) => item > 0);

    var netseriesePositive = netseries;

    var netserieseNegative = [];

    if (flectionPoint > 0) {
      netseriesePositive = netseries.slice(flectionPoint - 1);

      netserieseNegative = netseries.slice(0, flectionPoint);
    }

    let netseriesePositiveOption = {
      name: "Net Cashflow Positive",
      data: netseriesePositive.map(function (item, index) {
        item = item.toFixed(2);
        return [flectionPoint - 1 + index, item];
      }),
      type: "line",
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: "rgba(0, 125, 0, 0.6)",
          },
          {
            offset: 1,
            color: "rgba(0, 0, 0, 0)",
          },
        ]),
      },
      color: "green",
    };

    let netserieseNegativeOption = {
      name: "Net Cashflow Negative",
      data: netserieseNegative.map(function (item) {
        item = item.toFixed(2);
        return item;
      }),
      markLine: {
        symbol: ["none", "none"],
        label: { formatter: "Break Even" },
        lineStyle: { color: "rgba(125, 125, 125, 1)" },
        data: [{ xAxis: flectionPoint }],
      },
      type: "line",
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: "rgba(0, 0, 0, 0)",
          },
          {
            offset: 1,
            color: "rgba(255, 0, 0, 0.6)",
          },
        ]),
      },
      color: "red",
    };

    function format(data) {
      data = parseFloat(data);
      return data.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });
    }

    // const barCharcDom = document.getElementById("overviewChart");
    // let overviewChartchart = echarts.init(barCharcDom);

    // let overviewChartoption = {
    //   xAxis: {
    //     type: "category",
    //     boundaryGap: false,
    //     data: xaxis,
    //     name: "Months",
    //   },
    //   yAxis: {
    //     type: "value",
    //     name: "($)",
    //   },
    //   legend: {},

    //   tooltip: {
    //     trigger: "axis",
    //   },

    //   series: [
    //     summedSeries,
    //     costseries,
    //     netserieseNegativeOption,
    //     netseriesePositiveOption,
    //   ],
    // };
    // overviewChartchart.setOption(overviewChartoption);

    const barDom = document.getElementById("overviewBar");
    let barChart = echarts.init(barDom);

    var chartSeriesValues = [
      {
        value: income["Conor Vickers"] / 12,
        stack: "income",
        itemStyle: {
          color: "green",
        },
      },
      {
        value: income["Alexandra Hartzell"] / 12,
        stack: "income",
        itemStyle: {
          color: "green",
        },
      },
    ];
    var chartSeriesNames = ["Conor Vickers", "Alexandra Hartzell"];

    var netValue =
      income["Alexandra Hartzell"] / 12 + income["Conor Vickers"] / 12;

    Object.keys(costs).forEach((key) => {
      if (key === "monthly") {
        Object.keys(costs[key]).forEach((key2) => {
          netValue = netValue - parseFloat(costs[key][key2]);
          chartSeriesValues.push({
            value: parseFloat(costs[key][key2]),
            itemStyle: {
              color: "red",
            },
          });
          chartSeriesNames.push(key2);
        });
      }
    });

    chartSeriesValues.push({
      value: netValue,
      itemStyle: {},
    });
    chartSeriesNames.push("Net Cashflow");

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
  }, [timeframe, costs]);

  return (
    <>
      {/* <div id="overviewChart" style={{ width: "100%", height: "400px" }}></div> */}
      <div id="overviewBar" style={{ width: "100%", height: "400px" }}></div>
    </>
  );
}
