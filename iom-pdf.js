/* Inter Office Memo PDF generation */
const GAIL_LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgYGBgAAAABAABJzQnCgAAAABJRU5ErkJggg==';
function generateIOMPDF(model, monthLabel){
  if(!window.pdfMake){
    if (typeof toast === 'function') toast('PDF library failed to load','bad');
    else alert('PDF library failed to load');
    return;
  }
  const fmt = n => '₹ ' + (Number(n)||0).toLocaleString('en-IN',{minimumFractionDigits:2, maximumFractionDigits:2});
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB');
  const refNo = `GAIL/JLPL/862/IOM/HT-BILL/IPS/${monthLabel}`;
  const parts = (monthLabel||'').split('-');
  const longMonth = parts.length===2 ? `${parts[0]} 20${parts[1]}` : monthLabel;
  const items = [
    {no:'1', desc:`HT Bill (Electricity Bill for ${longMonth}).`, ref:`(Refer PGVCL's electricity bill for ${longMonth}).`, amt:model.FINAL_HT_Bill},
    {no:'2', desc:'Share of 4.5 MW', ref:"(Refer PGVCL's adjustment sheet)", amt:model.Share_4_5MW},
    {no:'3', desc:'Share of 14.7 MW', ref:"(Refer PGVCL's adjustment sheet)", amt:model.Share_14_7MW},
    {no:'4', desc:'Credit JV', ref:"(Refer PGVCL's adjustment sheet)", amt:model.Credit_JV},
    {no:'5', desc:'Credit TDS', ref:"(Refer PGVCL's adjustment sheet)", amt:model.Credit_TDS},
    {no:'6', desc:'Delayed Payment Charges', ref:"(Refer PGVCL's adjustment sheet)", amt:model.Delayed_Payment},
    {no:'7', desc:'Debit ED', ref:"(Refer PGVCL's adjustment sheet)", amt:model.Debit_ED},
    {no:'8', desc:'Balance Pending', ref:"(Refer PGVCL's adjustment sheet)", amt:model.Balance_Pending},
    {no:'9', desc:'Misc Payment', ref:"(Refer PGVCL's adjustment sheet)", amt:model.Misc_Payment}
  ];
  const net = model.FINAL_HT_Bill - model.Share_4_5MW - model.Share_14_7MW - model.Credit_JV - model.Credit_TDS + model.Delayed_Payment - model.Debit_ED - model.Balance_Pending;
  const tableBody = [
    [{text:'Item No.', bold:true}, {text:'Description', bold:true}, {text:'Reference', bold:true}, {text:'Amount', bold:true, alignment:'right'}],
    ...items.map(it => [
      {text:it.no, alignment:'center'},
      {text:it.desc},
      {text:it.ref},
      {text:fmt(it.amt), alignment:'right'}
    ]),
    [{text:'Net Payable (1-2-3-4-5+6-7-8)', colSpan:3, alignment:'right', bold:true}, {}, {}, {text:fmt(net), alignment:'right', bold:true}]
  ];
  const docDefinition = {
    pageSize:'A4',
    pageMargins:[40,40,40,40],
    content:[
      {
        columns:[
          {image:GAIL_LOGO_BASE64, width:60},
          {width:'*', stack:[{text:'GAIL (India) LIMITED', bold:true, fontSize:12}, {text:'Electrical Department', fontSize:10}], alignment:'center'},
          {text:`Date: ${dateStr}`, alignment:'right', fontSize:10}
        ]
      },
      {text:'HT-Bill IPS – Samakhiali', alignment:'center', bold:true, margin:[0,10,0,10]},
      {text:`Ref: ${refNo}`, margin:[0,0,0,8], fontSize:10},
      {text:'May please pay to "The Gujarat Wind Company Ltd (GSTIN: 24AAACT5589R1ZQ)" as per following details:', fontSize:10, margin:[0,0,0,6]},
      {table:{widths:['*'], body:[[{text:'A/c No.: 1234567890123456, RTGS/NEFT IFSC: SBIN0000000, Branch: Jaipur, SAP BAFS: 101', alignment:'center', color:'black', bold:true}]]}, layout:'noBorders', fillColor:'#FFEB3B', margin:[0,0,0,10]},
      {table:{widths:[40,'*','*',100], body:tableBody}, layout:{fillColor:(rowIndex)=>rowIndex===0?'#eeeeee':null, hLineWidth:(i,node)=>(i===0||i===tableBody.length)?1:0.5, vLineWidth:()=>0.5}},
      {text:`Net Payable: ${fmt(net)}`, alignment:'right', bold:true, margin:[0,4,0,10]},
      {text:'प्रमाणित करते हैं कि :', bold:true, margin:[0,8,0,4]},
      {ol:['विधुत देयक उचित है।','आवश्यक अनुमोदन प्राप्त है।','भुगतान की स्वीकृति दी जाती है।'], fontSize:10},
      {text:'संलग्नक : 1. PGVCL का बिल 2. Adjustment Sheet 3. Payment Advice', fontSize:10, margin:[0,8,0,20]},
      {columns:[{text:'उप महाप्रबन्धक (ओ एंड एम), सामाखखयाल', alignment:'center'}, {text:'उप महाप्रबन्धक (वित्त एवं लेखा), जयपुर', alignment:'center'}]}
    ],
    defaultStyle:{fontSize:10}
  };
  pdfMake.createPdf(docDefinition).download(`IOM_${monthLabel}.pdf`);
}
