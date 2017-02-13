import expect from 'expect';
import helper from '../helpers/helper';

describe('test helpers', () => {
  it('is isRealString', () => {
    let number = 123;
    let emptyString = '  ';
    let realString = 'realString';

    expect(helper.isRealString(number)).toBe(false);
    expect(helper.isRealString(emptyString)).toBe(false);
    expect(helper.isRealString(realString)).toBe(true);
  });

  it('is generateMessage', () => {
    let from = 'JooHyung';
    let text = 'Some text';
    let message = helper.generateMessage(from, text);

    expect(message).toInclude({from, text});
  });
});