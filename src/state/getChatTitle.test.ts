import { getChatTitle } from './getChatTitle';

describe('getChatTitle', () => {
  it('shows the phone number when it is known', () => {
    expect(getChatTitle({ chatId: '10000000', phone: '79001234567', name: 'Василиса' })).toBe(
      '+79001234567',
    );
  });

  it('falls back to the name, then to chatId when the phone is hidden', () => {
    expect(getChatTitle({ chatId: '10000000', phone: '', name: 'Василиса' })).toBe('Василиса');
    expect(getChatTitle({ chatId: '10000000', phone: '' })).toBe('10000000');
  });
});
