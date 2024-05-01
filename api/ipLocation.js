export const getDeviceDetails = async () => {
  let jsonData = await fetch("https://ipapi.co/json");
  let data = await jsonData.json();
  return data;
};
