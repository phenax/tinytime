// @flow

import {
FullMonth,
PartialMonth,
NumberMonth,
FullYear,
PartialYear,
DayOfTheWeek,
Hour,
Hour24,
Minutes,
Seconds,
PostOrAnteMeridiem,
UserText,
Day,
DayOfTheMonth,
} from './subs';
import type { Token } from './parser'
import type { TinyTimeOptions } from './index'

/**
 * These types help ensure we don't misspell them anywhere. They will be
 * removed during build.
 */
type Days = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
type Month =  "January" | "Febuary" | "March" | "April" | "May" | "June" | "July" | "August" | "September" | "October" | "November" | "December"

const months: Array<Month> = [
  "January",
  "Febuary",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
]

const partialMonths = months.map(m => m.slice(0, 3).toLowerCase());

const days: Array<Days> = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

/**
 * Takes an integer and returns a string left padded with
 * a zero to the left. Used to display minutes and hours (1:01:00PM);
 */
function paddWithZeros(int: number) : string {
  return int < 10 ? '0' + int : '' + int;
}

/**
 * Adds suffix to day, so 16 becomes 16th.
 */
function suffix(int: number): string {
    return (int % 10) == 1 && int != 11
      ? int  + "st"
      : (int % 10) == 2 && int != 12
      ? int + "nd"
      : (int % 10) == 3 && int != 13
      ? int + "rd"
      : int + "th";
}

/**
 * The compiler takes in our array of tokens returned from the parser
 * and returns the formed template. It just iterates over the tokens and
 * appends some text to the returned string depending on the type of token.
 * @param {Array<Tokens>} tokens
 * @param {Date} date
 * @param {TinyTimeOptions} options
 * @returns {String}
 */
export default function compiler(tokens: Array<Token>, date: Date, options: TinyTimeOptions): string {
  const month = date.getMonth();
  const year = date.getFullYear();
  const hours = date.getHours();
  const seconds = date.getSeconds();
  const minutes = date.getMinutes();
  const day = date.getDate();
  let compiled = '';
  let index = 0;
  while (index < tokens.length) {
    const token = tokens[index];
    switch (token.t) {
      case UserText:
      // $FlowFixMe flow doesn't know that v is always populated on UserText
        compiled += token.v;
        break;
      case Day:
        compiled += suffix(day);
        break;
      case PartialMonth:
        compiled += months[month].slice(0, 3);
        break;
      case FullMonth:
        compiled += months[month];
        break;
      case NumberMonth:
        let mnth = month + 1;
        if (options.padMonth) {
          mnth = paddWithZeros(mnth);
        }
        compiled += mnth;
        break;
      case FullYear:
        compiled += year;
        break;
      case PartialYear:
        compiled += (year + '').slice(2);
        break;
      case DayOfTheWeek:
        compiled += days[date.getDay()];
        break;
      case DayOfTheMonth:
        compiled += options.padDays ? paddWithZeros(day) : day
        break;
      case Hour:
        let hour = hours === 0 || hours === 12 ? 12 : hours % 12;
        if (options.padHours) {
          hour = paddWithZeros(hour)
        }
        compiled += hour
        break;
      case Hour24:
        let hour24 = hours;
        if (options.padHours) {
          hour24 = paddWithZeros(hour24)
        }
        compiled += hour24
        break;
      case Minutes:
        compiled += paddWithZeros(minutes);
        break;
      case Seconds:
        compiled += paddWithZeros(seconds);
        break;
      case PostOrAnteMeridiem:
        compiled += hours >= 12 ? 'PM' : 'AM';
        break;
    }
    index++;
  }
  return compiled;
}


export function compileDateString(tokens: Array<Token>, dateString: string): string {
  // const month = date.getMonth();
  // const year = date.getFullYear();
  // const hours = date.getHours();
  // const seconds = date.getSeconds();
  // const minutes = date.getMinutes();
  // const day = date.getDate();

  const parsedDate = new Date();
  let compiled = dateString;
  let index = 0;

  const matchRegex = (regex, str) => {
    const matches = str.match(regex);
    if (!matches) {
      throw new Error('Invalid time');
    }
    return matches;
  };

  while (index < tokens.length) {
    const token = tokens[index];
    switch (token.t) {
      case UserText:
        // $FlowFixMe flow doesn't know that v is always populated on UserText
        if (compiled.indexOf(token.v) === 0) {
          compiled = compiled.replace(token.v, '');
        }
        break;
      case Day: {
        const [, day, , rest] = matchRegex(/^(\d{0,2})(st|rd|nd|th)(.*)/, compiled);
        parsedDate.setDate(parseInt(day, 10));
        compiled = rest;
        break;
      }
      case PartialMonth: {
        const [, month, rest] = matchRegex(/^([A-Z]{3})(.*)/i, compiled);
        parsedDate.setMonth(partialMonths.indexOf(`${month}`.toLowerCase()));
        compiled = rest;
        break;
      }
      case FullMonth: {
        const [, month, rest] = matchRegex(/^([A-Z]+)(.*)/i, compiled);
        const monthList = months.map(m => m.toLowerCase());
        parsedDate.setMonth(monthList.indexOf(`${month}`.toLowerCase()));
        compiled = rest;
        break;
      }
      case NumberMonth: {
        const [, month, rest] = matchRegex(/^(\d{0,2})(.*)/, compiled);
        parsedDate.setMonth(parseInt(month, 10) - 1);
        compiled = rest;
        break;
      }
      case FullYear: {
        const [, year, rest] = matchRegex(/^(\d{4})(.*)/, compiled);
        parsedDate.setFullYear(parseInt(year, 10));
        compiled = rest;
        break;
      }
      case PartialYear: { // TODO: Confirm calculations
        const [, partialYear, rest] = matchRegex(/^(\d{2})(.*)/, compiled);
        const currentYear = parsedDate.getFullYear();
        const year = `${currentYear}`.slice(0, 2) + partialYear;
        parsedDate.setFullYear(parseInt(year, 10));
        compiled = rest;
        break;
      }
      case DayOfTheWeek:
        // compiled += days[date.getDay()];
        break;
      case DayOfTheMonth: {
        const [, day, rest] = matchRegex(/^(\d{0,2})(.*)/, compiled);
        parsedDate.setDate(parseInt(day, 10));
        compiled = rest;
        break;
      }
      case Hour:
        // let hour = hours === 0 || hours === 12 ? 12 : hours % 12;
        // if (options.padHours) {
        //   hour = paddWithZeros(hour)
        // }
        // compiled += hour
        break;
      case Hour24:
        // let hour24 = hours;
        // if (options.padHours) {
        //   hour24 = paddWithZeros(hour24)
        // }
        // compiled += hour24
        break;
      case Minutes:
        // compiled += paddWithZeros(minutes);
        break;
      case Seconds:
        // compiled += paddWithZeros(seconds);
        break;
      case PostOrAnteMeridiem:
        // compiled += hours >= 12 ? 'PM' : 'AM';
        break;
    }
    index++;
  }

  return parsedDate;
}
