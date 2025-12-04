// logger.js
const fs = require('fs');
const PDFDocument = require('pdfkit');

const logs = [];

const log = (...args) => {
  const message = args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : a)).join(' ');
  logs.push(message);
  console.log(...args);
};

const savePDF = (filename = 'test_logs.pdf') => {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filename));
  doc.font('Courier').fontSize(10);

  logs.forEach(line => {
    doc.text(line);
  });

  doc.end();
};

module.exports = { log, savePDF };
