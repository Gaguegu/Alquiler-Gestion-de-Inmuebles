import { Invoice, Tenant, Property, LandlordSettings } from '../types';

export interface SepaRemittanceData {
  messageId: string;
  creationDateTime: string;
  numberOfTransactions: number;
  totalAmount: number;
  collectionDate: string;
  creditorName: string;
  creditorNif: string;
  creditorIban: string;
  creditorBic?: string;
  invoices: {
    invoice: Invoice;
    tenant: Tenant;
    property?: Property;
  }[];
}

/**
 * Clean string for XML format (remove invalid chars, sanitize)
 */
function cleanXmlStr(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .trim();
}

/**
 * Formats IBAN removing spaces and uppercase
 */
export function sanitizeIban(iban: string): string {
  return (iban || '').replace(/[\s-]/g, '').toUpperCase();
}

/**
 * Generates official SEPA ISO 20022 XML (pain.008.001.02)
 * for direct debit upload to banking platforms.
 */
export function generateSepaXml(data: SepaRemittanceData): string {
  const msgId = cleanXmlStr(data.messageId || `REM-${Date.now()}`);
  const creationDt = data.creationDateTime || new Date().toISOString();
  const nbOfTxs = data.invoices.length;
  const ctrlSum = data.totalAmount.toFixed(2);
  const reqdColltnDt = data.collectionDate;
  const cdtrNm = cleanXmlStr(data.creditorName);
  const cdtrIban = sanitizeIban(data.creditorIban);
  const cdtrId = cleanXmlStr(data.creditorNif);

  let txListXml = '';

  data.invoices.forEach((item, index) => {
    const endToEndId = cleanXmlStr(`${item.invoice.number}`);
    const instdAmt = item.invoice.totalAmount.toFixed(2);
    const dbtrNm = cleanXmlStr(item.tenant.name);
    const dbtrIban = sanitizeIban(item.tenant.iban || '');
    const mndtId = cleanXmlStr(`MANDATO-${item.tenant.dniNie || item.tenant.id}`);
    const rmtInf = cleanXmlStr(`${item.invoice.concept} (${item.invoice.number})`);

    txListXml += `
      <DrctDbtTxInf>
        <PmtId>
          <EndToEndId>${endToEndId}</EndToEndId>
        </PmtId>
        <InstdAmt Ccy="EUR">${instdAmt}</InstdAmt>
        <DrctDbtTx>
          <MndtRltdInf>
            <MndtId>${mndtId}</MndtId>
            <DtOfSgntr>2023-01-01</DtOfSgntr>
          </MndtRltdInf>
        </DrctDbtTx>
        <DbtrAgt>
          <FinInstnId>
            <Othr>
              <Id>NOTPROVIDED</Id>
            </Othr>
          </FinInstnId>
        </DbtrAgt>
        <Dbtr>
          <Nm>${dbtrNm}</Nm>
        </Dbtr>
        <DbtrAcct>
          <Id>
            <IBAN>${dbtrIban}</IBAN>
          </Id>
        </DbtrAcct>
        <RmtInf>
          <Ustrd>${rmtInf}</Ustrd>
        </RmtInf>
      </DrctDbtTxInf>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.008.001.02" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <CstmrDrctDbtInitn>
    <GrpHdr>
      <MsgId>${msgId}</MsgId>
      <CreDtTm>${creationDt}</CreDtTm>
      <NbOfTxs>${nbOfTxs}</NbOfTxs>
      <CtrlSum>${ctrlSum}</CtrlSum>
      <InitgPty>
        <Nm>${cdtrNm}</Nm>
        <Id>
          <OrgId>
            <Othr>
              <Id>${cdtrId}</Id>
            </Othr>
          </OrgId>
        </Id>
      </InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>${msgId}-PMT01</PmtInfId>
      <PmtMtd>DD</PmtMtd>
      <NbOfTxs>${nbOfTxs}</NbOfTxs>
      <CtrlSum>${ctrlSum}</CtrlSum>
      <PmtTpInf>
        <SvcLvl>
          <Cd>SEPA</Cd>
        </SvcLvl>
        <LclInstrm>
          <Cd>CORE</Cd>
        </LclInstrm>
        <SeqTp>RCUR</SeqTp>
      </PmtTpInf>
      <ReqdColltnDt>${reqdColltnDt}</ReqdColltnDt>
      <Cdtr>
        <Nm>${cdtrNm}</Nm>
      </Cdtr>
      <CdtrAcct>
        <Id>
          <IBAN>${cdtrIban}</IBAN>
        </Id>
      </CdtrAcct>
      <CdtrAgt>
        <FinInstnId>
          <Othr>
            <Id>NOTPROVIDED</Id>
          </Othr>
        </FinInstnId>
      </CdtrAgt>
      <CdtrSchmeId>
        <Id>
          <PrvtId>
            <Othr>
              <Id>${cdtrId}</Id>
            </Othr>
          </PrvtId>
        </Id>
      </CdtrSchmeId>
      ${txListXml}
    </PmtInf>
  </CstmrDrctDbtInitn>
</Document>`.trim();
}

/**
 * Triggers browser download of generated SEPA XML file
 */
export function downloadSepaXmlFile(filename: string, xmlContent: string): void {
  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.xml') ? filename : `${filename}.xml`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
