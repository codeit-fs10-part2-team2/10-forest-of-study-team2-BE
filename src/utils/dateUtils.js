const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const isoWeek = require('dayjs/plugin/isoWeek');
const isoWeeksInYear = require('dayjs/plugin/isoWeeksInYear');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);

const TIMEZONE = 'Asia/Seoul';

const getCurrentDateInfo = () => {
  const now = dayjs().tz(TIMEZONE);
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
  const now = dayjs().tz(TIMEZONE);
  const startOfWeek = now.startOf('week');
  const endOfWeek = now.endOf('week');
  
  return {
    startOfWeek,
    endOfWeek,
  };
};

const getDateFromWeek = (year, week, day) => {
  const firstDayOfYear = dayjs.tz(`${year}-01-01`, TIMEZONE);
  const firstSunday = firstDayOfYear.startOf('week');
  const targetSunday = firstSunday.add(week, 'week');
  const targetDate = targetSunday.add(day, 'day');
  
  return targetDate;
};

const toDayjs = (date) => {
  return dayjs(date).tz(TIMEZONE);
};

const now = () => {
  return dayjs().tz(TIMEZONE);
};

module.exports = {
  getCurrentDateInfo,
  getCurrentWeekRange,
  getDateFromWeek,
  toDayjs,
  now,
  dayjs,
  TIMEZONE,
};
