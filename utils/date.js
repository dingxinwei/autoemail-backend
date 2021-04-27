function transformDate(dateStr) {
  const date = new Date(Date.parse(dateStr));
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}
function transformDateToYearMonthDay(dateStr) {
  const date = new Date(Date.parse(dateStr));
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}
module.exports = { transformDate, transformDateToYearMonthDay };
