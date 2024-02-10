export const parseFloatEst = (value) => {
  value = value.toString().replace(/,/g, "");
  return parseFloat(value);
};
