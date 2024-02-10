export const getTimeDifference = (t, page) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  let diff =
    new Date(
      new Date().toLocaleString("en-US", { timeZone: currentUser.timeZone })
    ).valueOf() - new Date(t).valueOf();
  let min = diff / 60000;
  if (page === "estimate" && min <= 1440) {
    return "Today";
  } else if (min <= 60) {
    return Math.round(min) + " Min(s) Ago";
  } else if (min > 60 && min <= 1440) {
    return Math.round(min / 60) + " Hour(s) Ago";
  } else if (min > 1440 && min <= 10080) {
    return Math.round(min / 1440) + " Day(s) Ago";
  } else if (min > 10080 && min <= 40320) {
    return Math.round(min / 10080) + " Week(s) Ago";
  } else if (min > 40320 && min <= 483840) {
    return Math.round(min / 40320) + " Month(s) Ago";
  } else if (min > 483840) {
    return Math.round(min / 483840) + " Year(s) Ago";
  }
};
