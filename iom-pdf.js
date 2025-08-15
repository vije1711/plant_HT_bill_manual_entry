(function(global){
  // Number formatters
  const INR = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const KWH = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
  const MWH = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  });
  const RATE = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 6,
    maximumFractionDigits: 6
  });

  function fmtCurrency(v){ return INR.format(Number.isFinite(v) ? v : 0); }
  function fmtKwh(v){ return KWH.format(Number.isFinite(v) ? v : 0); }
  function fmtMwh(v){ return MWH.format(Number.isFinite(v) ? v : 0); }
  function fmtRate(v){ return RATE.format(Number.isFinite(v) ? v : 0) + ' /kWh'; }

  function generateIOMPDF(model, monthLabel){
    if(!global.pdfMake){ console.error('pdfMake not loaded'); return; }
    const docDefinition = {
      content: [
        { text: `WEG Billing – ${monthLabel}`, style: 'header' },
        { text: 'HT Bill', style: 'subheader', margin: [0, 10, 0, 4] },
        {
          style: 'table',
          table: {
            widths: ['*', 'auto'],
            body: [
              ['Monthly Consumption', fmtKwh(model.A4) + ' kWh'],
              ['Demand Charges', fmtCurrency(model.B4)],
              ['Energy Charges', fmtCurrency(model.C4)],
              ['Night Rebate', fmtCurrency(model.D4)],
              ['Fuel Charge', fmtCurrency(model.E4)],
              ['PF Rebate', fmtCurrency(model.F4)],
              ['EHV Rebate', fmtCurrency(model.G4)],
              ['TOU', fmtCurrency(model.H4)],
              ['GT Charges', fmtCurrency(model.I4)],
              ['Total Consumption Charge', fmtCurrency(model.A9)],
              ['ED @ 20%', fmtCurrency(model.B9)],
              ['Current Month Bill', fmtCurrency(model.C9)]
            ]
          }
        },
        { text: 'Adjustments', style: 'subheader', margin: [0, 10, 0, 4] },
        {
          style: 'table',
          table: {
            widths: ['*', 'auto'],
            body: [
              ['Outstanding Arrears', fmtCurrency(model.D9)],
              ['Freeze Amount', fmtCurrency(model.E9)],
              ['Delayed Payment Charges', fmtCurrency(model.F9)],
              ['Advance Payment / Adjust.', fmtCurrency(model.G9)],
              ['Net Payable', fmtCurrency(model.H9)],
              ['Actual Amount to be Paid', fmtCurrency(model.I9)],
              ['Balance Pending from Previous Month', fmtCurrency(model.A31)]
            ]
          }
        },
        { text: 'WEG Shares', style: 'subheader', margin: [0, 10, 0, 4] },
        {
          style: 'table',
          table: {
            widths: ['*', 'auto'],
            body: [
              ['Bitlavadia Share', fmtKwh(model.A18) + ' kWh'],
              ['Nanisindhodi Share', fmtKwh(model.C18) + ' kWh'],
              ['Total Allocated', fmtKwh(model.A19) + ' kWh']
            ]
          }
        },
        { text: 'Wind Credits / Debits', style: 'subheader', margin: [0, 10, 0, 4] },
        {
          style: 'table',
          table: {
            widths: ['*', 'auto'],
            body: [
              ['Total Credit', fmtCurrency(model.A26)],
              ['Total Debit', fmtCurrency(model.B26)],
              ['Net Wind Credit', fmtCurrency(model.C26)]
            ]
          }
        },
        { text: 'Rates & Allocation', style: 'subheader', margin: [0, 10, 0, 4] },
        {
          style: 'table',
          table: {
            widths: ['*', 'auto'],
            body: [
              ['Wind Rate', fmtRate(model.B19)],
              ['Share 4.5 MW', fmtCurrency(model.F16)],
              ['Share 14.7 MW', fmtCurrency(model.G16)]
            ]
          }
        },
        { text: 'Final', style: 'subheader', margin: [0, 10, 0, 4] },
        {
          style: 'table',
          table: {
            widths: ['*', 'auto'],
            body: [
              ['Final Bill for IOM', fmtCurrency(model.FINAL)]
            ]
          }
        }
      ],
      styles: {
        header: { fontSize: 16, bold: true, alignment: 'center' },
        subheader: { fontSize: 13, bold: true },
        table: { margin: [0, 0, 0, 4] }
      },
      defaultStyle: { fontSize: 10 }
    };
    global.pdfMake.createPdf(docDefinition).download(`IOM_${monthLabel}.pdf`);
  }

  global.generateIOMPDF = generateIOMPDF;
  global.__iomPdfFmt = { fmtCurrency, fmtKwh, fmtMwh, fmtRate };
})(typeof window !== 'undefined' ? window : globalThis);
