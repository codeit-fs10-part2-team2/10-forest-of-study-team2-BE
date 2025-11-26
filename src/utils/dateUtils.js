const dayjs = require('dayjs');
const isoWeek = require('dayjs/plugin/isoWeek');
const isoWeeksInYear = require('dayjs/plugin/isoWeeksInYear');

dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);

const getCurrentDateInfo = () => {
  const now = dayjs();
  const year = now.year();
  const week = now.isoWeek() - 1;
  const day = now.day();
  
  return {
    year,
    week: Math.min(week, 53),
    day,
  };
};

const getCurrentWeekRange = () => {
  const now = dayjs();
  const startOfWeek = now.startOf('week');
  const endOfWeek = now.endOf('week');
  
  return {
    startOfWeek,
    endOfWeek,
  };
};

const getDateFromWeek = (year, week, day) => {
  const firstDayOfYear = dayjs(`${year}-01-01`);
  const firstSunday = firstDayOfYear.startOf('week');
  const targetSunday = firstSunday.add(week, 'week');
  const targetDate = targetSunday.add(day, 'day');
  
  return targetDate;
};

const toDayjs = (date) => {
  return dayjs(date);
};

const now = () => {
  return dayjs();
};

module.exports = {
  getCurrentDateInfo,
  getCurrentWeekRange,
  getDateFromWeek,
  toDayjs,
  now,
  dayjs,
};
