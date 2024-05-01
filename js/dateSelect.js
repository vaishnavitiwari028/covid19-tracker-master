import { listen, select } from "./DOMhelpers.js";

let yearFrom = select("#from_year");
let yearTo = select("#to_year");
let monthFrom = select("#from_month");
let monthTo = select("#to_month");
let dateFrom = select("#from_date");
let dateTo = select("#to_date");
let today = new Date();
let lastDatesByMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export default function () {
  let nowYear = today.getFullYear();
  let nowMonth = today.getMonth() + 1;
  let nowDate = today.getDate();

  let year = nowYear;
  let month = nowMonth;
  let date = nowDate - 1;
  if (nowMonth === 1 && nowDate === 1) {
    year = nowYear - 1;
    month = 12;
    date = 31;
  } else if (nowDate === 1) {
    year = nowYear;
    month = nowMonth - 1;
    date = lastDatesByMonth[month - 1];
  }

  [
    yearTo.querySelector(`[value="${year}"]`),
    monthTo.querySelector(`[value="${month}"]`),
    dateTo.querySelector(`[value="${date}"]`),
  ].forEach((el) => {
    el.setAttribute("selected", true);
  });

  showDateAccordingToMonth(monthFrom, dateFrom, yearFrom);
  showDateAccordingToMonth(monthTo, dateTo, yearTo);
}

function showDateAccordingToMonth(monthEl, dateEl, yearEl) {
  function onMonthorYearChange() {
    let diff;
    if (monthEl.value === "2" && yearEl.value === "2020") {
      diff = 2;
    } else diff = 31 - lastDatesByMonth[monthEl.value - 1];

    for (let i = 1; i <= 30; i++) {
      if (i <= diff) {
        dateEl.children[31 - i].disabled = true;
        dateEl.children[31 - i].style.visibility = "hidden";
      } else {
        dateEl.children[31 - i].disabled = false;
        dateEl.children[31 - i].style.visibility = "visible";
      }
    }
  }
  listen(monthEl, "change", onMonthorYearChange);
  listen(yearEl, "change", onMonthorYearChange);
}
