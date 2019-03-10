// @flow
import compiler, { compileDateString } from './compiler';
import parser from './parser'

type TinyTime = {
  render: (date: Date) => string,
  parse: (dateStr: string) => Date,
};

export type TinyTimeOptions = {
  padHours?: boolean,
  padDays?: boolean,
  padMonth?: boolean,
}

export default function tinytime(template: string, options: TinyTimeOptions = {}): TinyTime {
  const templateAST = parser(template);
  return {
    render(date: Date) {
      return compiler(templateAST, date, options )
    },
    parse(dateStr: string) {
      return compileDateString(templateAST, dateStr);
    },
  }
}
