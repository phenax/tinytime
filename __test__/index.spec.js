import tinytime from '../src';

// My birthday!
const date = new Date('September 24, 1992 021:07:30');

// Helper function to render template with the same date.
const render = template => tinytime(template).render(date);

describe('tinytime', () => {

  it('should export a function', () => {
    expect(typeof tinytime).toBe('function')
  });

  it('should return a template object', () => {
    const template = tinytime('The month is {MMMM}');
    expect(typeof template).toBe('object')
  });

  describe('rendering', () => {
    it('should let you render with a date/time', () => {
      expect(render('{h}:{mm}:{ss}{a} on a {dddd}.')).toEqual('9:07:30PM on a Thursday.');
    });
    it('full months', () => {
      expect(render('{MMMM}')).toEqual('September');
    });
    it('partial months', () => {
      expect(render('{MM}')).toEqual('Sep');
    });
    it('numeric months', () => {
      expect(render('{Mo}')).toEqual('9');
    });
    it('padded numeric months', () => {
      const template = tinytime('{Mo}', { padMonth: true })
      const rendered = template.render(date);
      expect(rendered).toEqual('09');
    });
    it('full years', () => {
      expect(render('{YYYY}')).toEqual('1992');
    });
    it('partial years', () => {
      expect(render('{YY}')).toEqual('92');
    })
    it('days of the week', () => {
      expect(render('{dddd}')).toEqual('Thursday');
    });
    it('day of the month', () => {
      expect(render('{Do}')).toEqual('24th');
    });
    it('times', () => {
      expect(render('{h}:{mm}:{ss}{a}')).toEqual('9:07:30PM');
    });
    it('times (24h)', () => {
      expect(render('{H}:{mm}:{ss}')).toEqual('21:07:30');
    });
    it('padded hours', () => {
      const template = tinytime('{h}', { padHours: true })
      const rendered = template.render(date)
      expect(rendered).toEqual('09')
    })
    it('padded hours (24h)', () => {
      const date = new Date('September 24, 1992 09:07:30');
      const template = tinytime('{H}', { padHours: true })
      const rendered = template.render(date)
      expect(rendered).toEqual('09')
    })
    it('user text with subsitutions', () => {
      expect(render(
        'It was {h}:{mm}:{ss}{a} on {MMMM} {Do}, {YYYY}.'
      )).toEqual(
        'It was 9:07:30PM on September 24th, 1992.'
      )
    });
    it('sundays', () => {
      expect(tinytime('{dddd}').render(new Date('May 7, 2017'))).toEqual('Sunday')
    });
  });

  describe('parsing', () => {
    const baseDate = new Date(1997, 4, 1, 0, 0, 0, 0);

    it ('should parse given date time from a string', () => {
      const date = tinytime('{Do} {Mo}, {YYYY}').parse('17th 05, 1997', { baseDate });
      expect(date.getDate()).toBe(17);
      expect(date.getMonth()).toBe(4);
      expect(date.getFullYear()).toBe(1997);
    });

    it ('partial month and partial year', () => {
      const date = tinytime('{DD}_{MM}_{YY}').parse('3_Nov_16', { baseDate });
      expect(date.getDate()).toBe(3);
      expect(date.getMonth()).toBe(10);
      expect(date.getFullYear()).toBe(2016);
    });

    it ('full month and full year', () => {
      const date = tinytime('{Do}_{MMMM}_{YYYY}').parse('3rd_November_2016', { baseDate });
      expect(date.getDate()).toBe(3);
      expect(date.getMonth()).toBe(10);
      expect(date.getFullYear()).toBe(2016);
    });

    it ('should parse event if the format has numbers', () => {
      const date = tinytime('{DD}5{MM}999{YY}').parse('035Nov99916', { baseDate });
      expect(date.getDate()).toBe(3);
      expect(date.getMonth()).toBe(10);
      expect(date.getFullYear()).toBe(2016);
    });

    // it ('week days', () => {
    //   const date = tinytime('3ds3{dddd}').parse('3ds3Friday', { baseDate });
    //   expect(date.getDate()).toBe(3);
    //   expect(date.getMonth()).toBe(10);
    //   expect(date.getFullYear()).toBe(2016);
    // });
  });
});