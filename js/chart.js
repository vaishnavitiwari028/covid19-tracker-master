export const makeLineChart = (
  DATE_LIST,
  CASE_LIST,
  RECOVERED_LIST,
  DEATH_LIST
) =>
  new Chart(document.getElementById("line-chart"), {
    type: "line",
    data: {
      labels: DATE_LIST,
      datasets: [
        {
          data: CASE_LIST,
          label: "Cases",
          borderColor: "#3e95cd",
          backgroundColor: "#3e95cd",
          borderWidth: 1,
          fill: false,
        },
        {
          data: RECOVERED_LIST,
          label: "Recovered",
          borderColor: "green",
          backgroundColor: "green",
          borderWidth: 1,
          fill: false,
        },
        {
          data: DEATH_LIST,
          label: "Deaths",
          borderColor: "red",
          backgroundColor: "red",
          borderWidth: 1,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "white",
            padding: 20,
            font: {
              size: "15",
            },
          },
        },
      },
    },
  });

export const makePieChart = (DATA_LIST) => {
  return new Chart(document.getElementById("pie-chart"), {
    type: "pie",
    data: {
      labels: ["Infected", "Recovered", "Deaths"],
      datasets: [
        {
          label: "Population (millions)",
          backgroundColor: ["#3e95cd", "green", "red"],
          data: DATA_LIST,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "white",
            padding: 50,
            font: {
              size: "15",
            },
          },
        },
      },
    },
  });
};
