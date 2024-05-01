export const formatDate = (yr, mo, da) => {
  let today = new Date();
  let year = yr || today.getFullYear();
  let month = mo || today.getMonth() + 1;
  let date = da || today.getDate() - 1;
  return `${year}-${month}-${date}`;
};

export const modifyDateLabel = (date) => {
  let monthList = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  date = date.slice(0, date.indexOf("T"));
  let labelDate = "";
  labelDate += date.slice(0, date.indexOf("-") + 1);
  let monthNum = +parseInt(date.slice(date.indexOf("-") + 1));
  labelDate += monthList[monthNum - 1];
  labelDate += date.slice(date.lastIndexOf("-"));
  return labelDate;
};

export const formatCountryInput = (text) => text.toLowerCase().trim();

export const getStoredData = (key) => {
  if (window.sessionStorage) {
    let storedData = sessionStorage.getItem(key);
    if (storedData !== null) {
      return JSON.parse(storedData);
    }
  }
};
export const setStoredData = (key, data) => {
  if (window.sessionStorage) {
    sessionStorage.removeItem(key);
    let dataToStore = JSON.stringify(data);
    sessionStorage.setItem(key, dataToStore);
  }
};
