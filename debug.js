const fs = require('fs');
const x = require('./backend/node_modules/xlsx');
const wb = x.readFile('transactions_export (1).xlsx');
const data = x.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
fs.writeFileSync('out_utf8.txt', JSON.stringify(data.slice(0, 2), null, 2), 'utf8');
