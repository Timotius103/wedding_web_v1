import { readFile, writeFile } from 'node:fs/promises';

const INPUT_FILE = process.argv[2] || new URL('../data/guests.csv', import.meta.url);
const OUTPUT_FILE = process.argv[3] || new URL('../data/guests.json', import.meta.url);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        value += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        value += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(value);
      value = '';
    } else if (char === '\n') {
      row.push(value);
      rows.push(row);
      row = [];
      value = '';
    } else if (char !== '\r') {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  return rows.filter((items) => items.some((item) => item.trim() !== ''));
}

function normalizeValue(key, value) {
  const trimmed = value.trim();
  if (key === 'maxGuests' && trimmed !== '') {
    const parsed = Number(trimmed);
    if (Number.isInteger(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  return trimmed;
}

const csv = (await readFile(INPUT_FILE, 'utf8')).replace(/^\uFEFF/, '');
const rows = parseCsv(csv);
const [headers, ...records] = rows;

if (!headers || headers.length === 0) {
  throw new Error('CSV file must include a header row.');
}

for (const requiredHeader of ['id', 'name']) {
  if (!headers.includes(requiredHeader)) {
    throw new Error(`CSV file is missing required "${requiredHeader}" column.`);
  }
}

const guests = {};

records.forEach((record, index) => {
  const guest = {};

  headers.forEach((header, headerIndex) => {
    guest[header] = normalizeValue(header, record[headerIndex] || '');
  });

  const id = String(guest.id || '').trim();
  const name = String(guest.name || '').trim();

  if (!id) {
    throw new Error(`Guest row ${index + 2} is missing an id.`);
  }

  if (!name) {
    throw new Error(`Guest row ${index + 2} is missing a name.`);
  }

  if (Object.prototype.hasOwnProperty.call(guests, id)) {
    throw new Error(`Duplicate guest id "${id}" in row ${index + 2}.`);
  }

  guest.id = id;
  guest.name = name;
  guests[id] = guest;
});

await writeFile(OUTPUT_FILE, `${JSON.stringify({ guests }, null, 2)}\n`, 'utf8');
console.log(`Wrote ${Object.keys(guests).length} guests to data/guests.json`);
