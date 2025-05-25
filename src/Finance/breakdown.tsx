export const costdefault = {
  monthly: {
    Rent: 5450,
    Parking: 900,
    Internet: 80,

    Food: 2000,
    Loans: 300,
  },
};

export const income = {
  "Conor Vickers": 200000,
  "Alexandra Hartzell": 100000,
};

export function calculateCosts(costseriesdata, timeframe, costs) {
  Object.keys(costs)
    .filter((key) => key !== "sqft")
    .forEach((key) => {
      if (key === "monthly") {
        Object.keys(costs[key]).forEach((key2) => {
          var costtoadd = parseFloat(costs[key][key2]);
          if (key2.endsWith("*")) {
            costtoadd = costtoadd * costs.sqft;
          }
          for (let i = 0; i < timeframe + 1; i++) {
            costseriesdata[i] = costseriesdata[i] - costtoadd;
          }
        });
      } else if (key === "start") {
        Object.keys(costs[key]).forEach((key2) => {
          var costtoadd = parseFloat(costs[key][key2]);
          if (key2.endsWith("*")) {
            costtoadd = costtoadd * costs.sqft;
          }

          costseriesdata[0] = costseriesdata[0] - costtoadd;
        });
      } else if (key === "yearly") {
        Object.keys(costs[key]).forEach((key2) => {
          var costtoadd = parseFloat(costs[key][key2]) / 12;
          if (key2.endsWith("*")) {
            costtoadd = costtoadd * costs.sqft;
          }

          for (let i = 0; i < timeframe + 1; i++) {
            costseriesdata[i] = costseriesdata[i] - costtoadd;
          }
        });
      }
    });
  return costseriesdata;
}
