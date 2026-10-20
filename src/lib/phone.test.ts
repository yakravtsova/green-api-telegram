import { formatPhone, normalizePhone } from './phone';

describe('normalizePhone', () => {
  it.each([
    ['79001234567', '79001234567'],
    ['+7 (900) 123-45-67', '79001234567'],
    ['8 900 123 45 67', '79001234567'],
    ['+375 29 123-45-67', '375291234567'],
    ['  +7-900-123-45-67  ', '79001234567'],
  ])('converts %j to %j', (phone, digits) => {
    expect(normalizePhone(phone)).toBe(digits);
  });

  it.each(['', 'abc', '123456789', '1234567890123456'])('rejects %j', (phone) => {
    expect(normalizePhone(phone)).toBeNull();
  });
});

describe('formatPhone', () => {
  it('adds a plus sign', () => {
    expect(formatPhone('79001234567')).toBe('+79001234567');
  });
});
