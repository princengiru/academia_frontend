import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const accountPath = path.join(__dirname, '../src/pages/academia/learner/account.jsx');
const outPath = path.join(__dirname, '../src/pages/academia/learner/phoneCountries.js');

const source = fs.readFileSync(accountPath, 'utf8');
const match = source.match(/const COUNTRIES = \[([\s\S]*?)\];/);
if (!match) {
  console.error('COUNTRIES block not found');
  process.exit(1);
}

const helpers = `
export const formatPhoneDigits = (raw, pattern) => {
  const digits = String(raw || '').replace(/\\D/g, '');
  let result = '';
  let di = 0;
  for (let i = 0; i < pattern.length && di < digits.length; i++) {
    if (pattern[i] === '#') { result += digits[di++]; }
    else { result += pattern[i]; }
  }
  return result;
};

export function formatTelephoneDisplay(phone, countryCode = 'RW') {
  if (!phone) return '—';
  const country = PHONE_COUNTRIES.find((c) => c.code === countryCode) || PHONE_COUNTRIES.find((c) => c.code === 'RW');
  if (!country) return phone;
  const dialDigits = country.dial.replace(/\\D/g, '');
  let digits = String(phone).replace(/\\D/g, '');
  if (digits.startsWith(dialDigits)) {
    digits = digits.slice(dialDigits.length);
  } else if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  const formatted = formatPhoneDigits(digits, country.pattern);
  return \`(\${dialDigits}) \${formatted}\`.trim();
}
`;

const output = `export const PHONE_COUNTRIES = [${match[1]}];\n${helpers}`;
fs.writeFileSync(outPath, output);
console.log('Wrote', outPath, output.length, 'bytes');
