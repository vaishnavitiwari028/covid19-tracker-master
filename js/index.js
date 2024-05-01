import { getByDateRange, getSummary } from "../api/covid19details.js";
import { getDeviceDetails } from "../api/ipLocation.js";
import { makeLineChart, makePieChart } from "./chart.js";
import countryList from "./countryList.js";
import configDateSelection from "./dateSelect.js";
import { listen, select } from "./DOMhelpers.js";
import {
  formatCountryInput,
  formatDate,
  getStoredData,
  modifyDateLabel,
  setStoredData,
} from "./utility.js";
const countryName = select(".country_name");
const totalCases = select(".total_cases h5");
const recoveredCases = select(".recovered_cases h5");
const deathCases = select(".death_cases h5");
const countryInputLabel = select(".country_input_label");
const datesChangeLabel = select(".dates_change_label");
const dataTable = select(".data_table_body");
const countriesHideBtn = select(".countries_hide_btn");
const datesHideBtn = select(".dates_hide_btn");
const countrySelection = select(".country_selection");
const countryInput = select(".country_selection_input");
const yourLocation = select(".your_location_wrapper");
const allCountriesContainer = select(".all_countries_container");
const pieStatCountry = select(".pie_stats_for_country");
const globalInfectionCount = select(".global_infected span");
const globalRecoveredCount = select(".global_recovered span");
const datesSelectionContainer = select(".date_selection");
const globalDeathCount = select(".global_deaths span");
const pieStatsText = select(".pie_stats_for_country");
const datesSubmitBtn = select(".dates-submit_btn");
let LineChart;
let PieChart;
let LINE_RECOVERED_LIST = [];
let LINE_DEATH_LIST = [];
let LINE_CASE_LIST = [];
let LINE_DATE_LIST = [];
let PIE_LIST = [];
let CURRENT_COUNTRY;
let SUMMARY_DATA_IN_MEMORY;
let SUMMARY_DATA_IN_STORAGE = getStoredData("GLOBAL_COVID_DATA");

configDateSelection();

const populateChartLists = (countryData, pieData) => {
  LINE_RECOVERED_LIST = [];
  LINE_DEATH_LIST = [];
  LINE_CASE_LIST = [];
  LINE_DATE_LIST = [];
  PIE_LIST = pieData ? pieData : [0, 0, 0];
  countryData.forEach((perDate) => {
    let { Confirmed, Recovered, Deaths, Date } = perDate;
    LINE_RECOVERED_LIST.push(+Recovered);
    LINE_CASE_LIST.push(+Confirmed);
    LINE_DEATH_LIST.push(+Deaths);
    LINE_DATE_LIST.push(modifyDateLabel(Date));
    if (!pieData) {
      PIE_LIST[0] += +Confirmed - PIE_LIST[0];
      PIE_LIST[1] += +Recovered - PIE_LIST[1];
      PIE_LIST[2] += +Deaths - PIE_LIST[2];
    }
  });

  select(".recovery_rate_data").textContent = `${(
    (PIE_LIST[1] / PIE_LIST[0]) *
    100
  ).toFixed(2)}%`;
  select(".mortality_rate_data").textContent = `${(
    (PIE_LIST[2] / PIE_LIST[0]) *
    100
  ).toFixed(2)}%`;
  updateLineChart();
  updatePieChart();
};

const updateDataTable = (countries, num) => {
  let allRows = "";
  countries.slice(0, num).forEach((each) => {
    let row = `<tr>
   <td>${each.Country}</td>
   <td>${each.TotalConfirmed}</td>
   <td>${
     each.TotalRecovered ||
     each.TotalConfirmed -
       each.TotalDeaths -
       Math.round(each.TotalConfirmed * 0.1)
   }</td>
   <td>${each.TotalDeaths}</td>
   </tr>`;
    allRows += row;
  });
  dataTable.insertAdjacentHTML("beforeEnd", allRows);
};

const createDataTable = (countries) => {
  countries.sort((a, b) => b.TotalConfirmed - a.TotalConfirmed);
  updateDataTable(countries, 20);
};

const updateGlobalData = async () => {
  let summary = await getSummary();
  let { Global, Countries } = summary;
  let { TotalConfirmed, TotalRecovered, TotalDeaths } = Global;
  globalInfectionCount.textContent = TotalConfirmed;
  globalRecoveredCount.textContent = TotalRecovered;
  globalDeathCount.textContent = TotalDeaths;
  if (Countries) {
    createDataTable(Countries);
  }
  SUMMARY_DATA_IN_MEMORY = summary;
  setStoredData("GLOBAL_COVID_DATA", summary);
};

function showCountrySelection(e) {
  countryInput.classList.add("visible");
  countrySelection.classList.add("visible");
  hideDatesSelection();
}
function hideCountrySelection(e) {
  countryInput.value = "";
  countryInput.classList.remove("visible");
  countrySelection.classList.remove("visible");
  updateCountryList();
}
function showDatesSelection(e) {
  datesSelectionContainer.style.transform = "none";
  hideCountrySelection();
}
function hideDatesSelection(e) {
  datesSelectionContainer.style.transform = "scale(0)";
}
const updateStatTexts = (country, totalNum, recoveredNum, deathNum) => {
  countryName.textContent = country.replace("-", " ");
  pieStatCountry.textContent = `for ${country.replace("-", " ")}`;
  totalCases.textContent = totalNum;
  recoveredCases.textContent = recoveredNum;
  deathCases.textContent = deathNum;
};

const changeCountry = async (country, from, to) => {
  let Stats_Done = false;
  let TotalConfirmed, TotalRecovered, TotalDeaths;
  countryName.textContent = "Loading...";
  if (SUMMARY_DATA_IN_MEMORY || SUMMARY_DATA_IN_STORAGE) {
    let storedData = SUMMARY_DATA_IN_MEMORY || SUMMARY_DATA_IN_STORAGE;
    let countryFromStore = storedData.Countries.find(
      ({ Slug }) => Slug === country
    );
    if (countryFromStore) {
      TotalConfirmed = countryFromStore.TotalConfirmed;
      TotalRecovered = countryFromStore.TotalRecovered;
      TotalDeaths = countryFromStore.TotalDeaths;
      updateStatTexts(country, TotalConfirmed, TotalRecovered, TotalDeaths);
      Stats_Done = true;
    }
  }
  CURRENT_COUNTRY = country;
  try {
    let countryData = await getByDateRange(
      country,
      from ? formatDate(...from) : formatDate(2020, 1, 1),
      to ? formatDate(...to) : formatDate()
    );

    if (!Stats_Done) {
      let { Confirmed, Recovered, Deaths } = countryData[
        countryData.length - 1
      ];
      updateStatTexts(country, Confirmed, Recovered, Deaths);
    }

    if (Stats_Done) {
      populateChartLists(countryData, [
        TotalConfirmed,
        TotalRecovered,
        TotalDeaths,
      ]);
    } else populateChartLists(countryData);
  } catch (e) {
    countryName.textContent = "Unable To Load";
  }
};

const updateCountryList = (list) => {
  let listToFilter = list || countryList;
  let totalCountryList = ``;
  listToFilter.forEach((each) => {
    let li = `<li data-slug="${each.Slug}" class="country ${each.Country}_country">
    <span>${each.Country}</span>
    </li>`;
    totalCountryList += li;
  });
  allCountriesContainer.innerHTML = "";
  allCountriesContainer.insertAdjacentHTML("beforeEnd", totalCountryList);
};

const updateVisibleCountries = (e) => {
  if (e.target.value) {
    const formatedCountry = formatCountryInput(e.target.value);
    const matches = countryList.filter(({ Country }) =>
      Country.toLowerCase().startsWith(formatedCountry)
    );
    updateCountryList(matches);
  } else updateCountryList();
};

const onCountryClick = (e) => {
  countryInput.value = "";
  if (e.target.tagName === "SPAN") {
    let slug = e.target.closest("li.country").dataset.slug;
    changeCountry(slug);
    hideCountrySelection();
  }
};

const onDatesSubmit = () => {
  let fromYear = select("#from_year").value;
  let fromMonth = select("#from_month").value;
  let fromDate = select("#from_date").value;
  let toYear = select("#to_year").value;
  let toMonth = select("#to_month").value;
  let toDate = select("#to_date").value;
  select(".dates-error").textContent = "";

  if (new Date(fromYear, fromMonth - 1, fromDate) < new Date(2020, 0, 22)) {
    select(
      ".dates-error"
    ).textContent = `We dont have records before 22.1.2020`;
    return;
  }
  if (
    new Date() < new Date(toYear, toMonth - 1, toDate) ||
    new Date() < new Date(fromYear, fromMonth - 1, fromDate)
  ) {
    select(".dates-error").textContent = `We cant go to the future`;
    return;
  }
  if (
    new Date(toYear, toMonth - 1, toDate) <
    new Date(fromYear, fromMonth - 1, fromDate)
  ) {
    select(
      ".dates-error"
    ).textContent = `Make sure "to" date comes after "from" date`;
    return;
  }

  changeCountry(
    CURRENT_COUNTRY,
    [fromYear, fromMonth, fromDate],
    [toYear, toMonth, toDate]
  );
  hideDatesSelection();
};

const updateForUserLocation = async (e) => {
  if (e) {
    hideCountrySelection();
  }
  let data = await getDeviceDetails();
  let { country_name } = data;
  changeCountry(country_name);
};

listen(window, "DOMContentLoaded", async () => {
  updateForUserLocation();
  updateGlobalData();
  updateCountryList();
});
listen(countryInput, "input", updateVisibleCountries);
listen(countryInputLabel, "click", showCountrySelection);
listen(yourLocation, "click", updateForUserLocation);
listen(countriesHideBtn, "click", hideCountrySelection);
listen(allCountriesContainer, "click", onCountryClick);
listen(datesChangeLabel, "click", showDatesSelection);
listen(datesHideBtn, "click", hideDatesSelection);
listen(datesSubmitBtn, "click", onDatesSubmit);

function updateLineChart() {
  if (LineChart) {
    LineChart.destroy();
  }
  LineChart = makeLineChart(
    LINE_DATE_LIST,
    LINE_CASE_LIST,
    LINE_RECOVERED_LIST,
    LINE_DEATH_LIST
  );
}
function updatePieChart() {
  if (PieChart) {
    PieChart.destroy();
  }
  PieChart = makePieChart(PIE_LIST);
}
