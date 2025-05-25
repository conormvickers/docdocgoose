import * as echarts from "echarts";
import { useEffect } from "react";
import { calculateCosts } from "./breakdown";

export default function DoughnutGraph({ record }) {
  useEffect(() => {
    if (!record) return;

    const uniqueRecords = record.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.tellerid === item.tellerid)
    );

    const barDom = document.getElementById("doughboi");
    let barChart = echarts.init(barDom);

    var piechartdata: { [key: string]: number } = {};
    var fullnameMap: { [key: string]: string } = {};
    for (let i = 0; i < uniqueRecords.length; i++) {
      if (uniqueRecords[i].amount < 0) {
        const first5chars = uniqueRecords[i].name
          .replace("POS DEBIT ", "")
          .replaceAll(" ", "")
          .substring(0, 5);
        if (Object.keys(piechartdata).includes(first5chars)) {
          piechartdata[first5chars] =
            piechartdata[first5chars] + -1 * uniqueRecords[i].amount;
        } else {
          piechartdata[first5chars] = -1 * uniqueRecords[i].amount;
          fullnameMap[first5chars] = uniqueRecords[i].name;
        }
      }
    }

    let barOption = {
      legend: { show: false },
      radius: ["40%", "70%"],

      tooltip: {
        trigger: "item",
      },
      series: [
        {
          data: Object.keys(piechartdata)
            .map((key) => {
              return {
                name: fullnameMap[key],
                value: piechartdata[key],
              };
            })
            .sort((a, b) => b.value - a.value),
          radius: ["40%", "70%"],

          type: "pie",
        },
      ],
    };
    barChart.setOption(barOption);
  }, [record]);

  return (
    <>
      <div id="doughboi" style={{ width: "100%", height: "400px" }}></div>
    </>
  );
}
