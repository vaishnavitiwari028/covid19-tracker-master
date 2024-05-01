const startFetch = async (url) => {
  const jsonData = await fetch(url);
  return jsonData.json();
};

export const getByDateRange = (countryName, from, to) =>
  startFetch(
    `https://api.covid19api.com/country/${countryName}?from=${from}T00:00:00Z&to=${to}T00:00:00Z`
  );

export const getByCountryLive = (country, date) =>
  startFetch(
    `https://api.covid19api.com/live/country/${country}/status/confirmed/date/${date}T00:00:00Z`
  );

export const getSummary = () =>
  startFetch(`https://api.covid19api.com/summary`);

export const getByCountry = (country) =>
  startFetch(`https://api.covid19api.com/country/${country}`);
