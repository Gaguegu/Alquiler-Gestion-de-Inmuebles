import { Property, Tenant, Contract, LandlordSettings } from '../types';
import { formatCurrency, formatDate } from './storage';

export interface TemplateContext {
  settings: LandlordSettings;
  property?: Property;
  tenant?: Tenant;
  contract?: Contract;
  customData?: Record<string, string | number>;
}

export interface LegalTemplate {
  id: string;
  title: string;
  category: 'contratos' | 'notificaciones' | 'finiquitos';
  description: string;
  generate: (ctx: TemplateContext) => string;
}

export const legalTemplates: LegalTemplate[] = [
  {
    id: 'notificacion-ipc',
    title: 'Notificación de Actualización de Renta (IPC / IRAV)',
    category: 'notificaciones',
    description: 'Comunicación fehaciente obligatoria al inquilino con 30 días de antelación según el Art. 18 de la LAU.',
    generate: (ctx) => {
      const { settings, property, tenant, contract, customData } = ctx;
      const today = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
      const currentRent = contract?.monthlyRent || property?.currentRent || 1000;
      const ipcPercent = customData?.ipcPercent ?? 2.5;
      const newRent = Number(customData?.newRent ?? (currentRent * (1 + Number(ipcPercent) / 100)).toFixed(2));
      const difference = (newRent - currentRent).toFixed(2);
      const effectiveDate = customData?.effectiveDate || 'el próximo mes';

      return `NOTIFICACIÓN FORMAL DE ACTUALIZACIÓN DE RENTA DE ARRENDAMIENTO

En ${settings.landlordCity || 'Madrid'}, a ${today}.

DE:
${settings.landlordName}
NIF/CIF: ${settings.landlordNif}
Domicilio: ${settings.landlordAddress}, ${settings.landlordPostalCode} ${settings.landlordCity}
(En calidad de parte ARRENDADORA)

A:
D./Dña. ${tenant?.name || '[Nombre del Inquilino]'}
NIF/NIE: ${tenant?.dniNie || '[DNI/NIE]'}
Inmueble arrendado: ${property?.address || '[Dirección del Inmueble]'}, ${property?.postalCode || ''} ${property?.city || ''}
(En calidad de parte ARRENDATARIA)

ASUNTO: Notificación preceptiva de actualización de la renta de arrendamiento según el Art. 18 de la Ley de Arrendamientos Urbanos (LAU).

Muy Sr./Sra. nuestro/a:

Por medio de la presente, y de conformidad con lo estipulado en el contrato de arrendamiento suscrito entre las partes de fecha ${formatDate(contract?.startDate)}, y al amparo de lo dispuesto en el artículo 18 de la Ley 29/1994, de 24 de noviembre, de Arrendamientos Urbanos (conforme a las modificaciones introducidas por la Ley 12/2023, de 24 de mayo, por el derecho a la vivienda), le comunicamos formalmente la revisión anual de la renta que rige el arrendamiento de la vivienda/inmueble referenciado.

A tal efecto, se procede a aplicar la variación correspondiente:
1. Renta base actual: ${formatCurrency(currentRent)} mensuales.
2. Porcentaje de variación aplicable: ${ipcPercent}% (conforme a la publicación oficial del Instituto Nacional de Estadística - INE y los límites legales vigentes).
3. Incremento mensual resultante: +${formatCurrency(Number(difference))}.
4. NUEVA RENTA MENSUAL: ${formatCurrency(newRent)} mensuales.

Dicha nueva renta tendrá plena efectividad a partir del día ${effectiveDate}, fecha a partir de la cual los recibos mensuales girados ascenderán al expresado importe de ${formatCurrency(newRent)}.

Se expide la presente notificación con la antelación debida a fin de dar cabal cumplimiento a las previsiones legales vigentes.

Agradeciendo de antemano su confianza y atención, le saluda atentamente,


__________________________________________
Por la parte Arrendadora:
${settings.landlordName}
NIF/CIF: ${settings.landlordNif}`;
    }
  },
  {
    id: 'finiquito-fianza',
    title: 'Documento de Finiquito, Entrega de Llaves y Devolución de Fianza',
    category: 'finiquitos',
    description: 'Acta de finalización de contrato, recepción del inmueble, compensación de suministros o desperfectos y liquidación de garantías.',
    generate: (ctx) => {
      const { settings, property, tenant, contract, customData } = ctx;
      const today = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
      const depositTotal = (contract?.deposit || 0) + (contract?.additionalDeposit || 0);
      const deductions = Number(customData?.deductionsTotal || 0);
      const refundAmount = Math.max(0, depositTotal - deductions);
      const owedAmount = deductions > depositTotal ? deductions - depositTotal : 0;
      const deductionsDetail = customData?.deductionsDetail || '- Suministros y consumos liquidados a la fecha.';

      return `DOCUMENTO DE FINALIZACIÓN DE CONTRATO DE ARRENDAMIENTO, ENTREGA DE LLAVES Y LIQUIDACIÓN DE FIANZA

En ${settings.landlordCity || 'Madrid'}, a ${today}.

REUNIDOS:
DE UNA PARTE: ${settings.landlordName}, con NIF/CIF ${settings.landlordNif}, como PARTE ARRENDADORA.
DE OTRA PARTE: ${tenant?.name || '[Inquilino]'}, con NIF/NIE ${tenant?.dniNie || '[DNI/NIE]'}, como PARTE ARRENDATARIA.

Ambas partes se reconocen mutuamente capacidad jurídica suficiente para el otorgamiento del presente documento y, al efecto:

EXPONEN:
I. Que con fecha ${formatDate(contract?.startDate)}, ambas partes suscribieron contrato de arrendamiento sobre la finca situada en ${property?.address || '[Dirección]'}, ${property?.city || ''}.
II. Que de mutuo acuerdo y por cumplimiento del término convenido, ambas partes resuelven el contrato de arrendamiento en la fecha de hoy.
III. Que la parte arrendataria hace entrega en este acto de la totalidad de los juegos de llaves del inmueble a la parte arrendadora, quien las recibe y toma posesión del mismo.

CLÁUSULAS:
PRIMERA.- ESTADO DEL INMUEBLE Y SUMINISTROS:
La parte arrendadora inspecciona el inmueble y se hace constar el estado general de conservación y la última lectura de los suministros:
${deductionsDetail}

SEGUNDA.- LIQUIDACIÓN ECONÓMICA DE GARANTÍAS Y FIANZA:
- Fianza legal depositada: ${formatCurrency(contract?.deposit || 0)}
- Garantía adicional depositada: ${formatCurrency(contract?.additionalDeposit || 0)}
- TOTAL GARANTÍAS RECIBIDAS: ${formatCurrency(depositTotal)}
- TOTAL DEDUCCIONES CONVENIDAS: ${formatCurrency(deductions)}

${refundAmount > 0 ? `SALDO NETO A FAVOR DEL ARRENDATARIO: ${formatCurrency(refundAmount)}, importe que el arrendador se compromete a abonar mediante transferencia bancaria al IBAN del arrendatario: ${tenant?.iban || 'IBAN convenido'} en el plazo máximo estipulado por la LAU.` : ''}
${owedAmount > 0 ? `SALDO A FAVOR DEL ARRENDADOR: ${formatCurrency(owedAmount)}, que el arrendatario abona o reconoce adeudar por superar los desperfectos y consumos el importe de la fianza.` : ''}

TERCERA.- FINIQUITO GENERAL:
Con el cumplimiento de las estipulaciones precedentes, ambas partes declaran extinguida plenamente la relación arrendaticia, dándose por liquidadas y finiquitadas cuantas obligaciones pudieran derivarse del contrato, sin que nada más se tengan que reclamar por ningún concepto.

En prueba de conformidad, firman el presente documento por duplicado ejemplar en el lugar y fecha arriba indicados.


_______________________________                _______________________________
POR EL ARRENDADOR                              POR EL ARRENDATARIO
${settings.landlordName}                       ${tenant?.name || 'El Inquilino'}`;
    }
  },
  {
    id: 'contrato-vivienda',
    title: 'Contrato de Arrendamiento de Vivienda Habitual (Modelo LAU)',
    category: 'contratos',
    description: 'Modelo oficial adaptado a la Ley de Arrendamientos Urbanos vigente para viviendas de alquiler de larga estancia.',
    generate: (ctx) => {
      const { settings, property, tenant, contract } = ctx;
      const today = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

      return `CONTRATO DE ARRENDAMIENTO DE VIVIENDA HABITUAL

En ${settings.landlordCity || 'Madrid'}, a ${today}.

COMPARECEN:
DE UNA PARTE, COMO ARRENDADOR:
${settings.landlordName}, con NIF/CIF ${settings.landlordNif}, con domicilio a efectos de notificaciones en ${settings.landlordAddress}, ${settings.landlordPostalCode} ${settings.landlordCity}, teléfono ${settings.landlordPhone} y correo electrónico ${settings.landlordEmail}.

DE OTRA PARTE, COMO ARRENDATARIO:
D./Dña. ${tenant?.name || '[Nombre del Inquilino]'}, mayor de edad, con NIF/NIE ${tenant?.dniNie || '[DNI/NIE]'}, con teléfono ${tenant?.phone || ''} y correo electrónico ${tenant?.email || ''}.

Ambas partes intervienen en su propio nombre y derecho, y reconociéndose capacidad legal bastante para el otorgamiento del presente contrato,

MANIFIESTAN:
I.- Que la parte arrendadora es propietaria de la vivienda sita en ${property?.address || '[Dirección]'}, ${property?.postalCode || ''} ${property?.city || ''} (${property?.province || ''}), con una superficie de ${property?.surfaceM2 || 80} m² y Referencia Catastral ${property?.cadastralRef || '[Ref. Catastral]'}.

II.- Que interesando a la parte arrendataria el arrendamiento de dicha vivienda para destinarla de forma primordial a satisfacer su necesidad permanente de vivienda habitual, ambas partes formalizan el presente CONTRATO DE ARRENDAMIENTO conforme a las siguientes:

ESTIPULACIONES:
PRIMERA.- DESTINO Y OBJETO:
La parte arrendadora cede en arrendamiento a la arrendataria, que acepta, la vivienda descrita en el Expositivo I, destinada exclusivamente a vivienda habitual del arrendatario y su unidad familiar, quedando expresamente prohibido el subarriendo total o parcial, así como la cesión o el uso turístico o comercial de la misma.

SEGUNDA.- DURACIÓN Y PRÓRROGAS:
El plazo de duración pactado es de UN AÑO, con efectos desde el ${formatDate(contract?.startDate) || '[Fecha Inicio]'} hasta el ${formatDate(contract?.endDate) || '[Fecha Fin]'}. Llegado el día del vencimiento del contrato, éste se prorrogará obligatoriamente por plazos anuales hasta que el arrendamiento alcance una duración mínima de cinco años (o siete si el arrendador fuese persona jurídica), de conformidad con el artículo 9 de la LAU.

TERCERA.- RENTA Y FORMA DE PAGO:
La renta mensual convenida libremente es de ${formatCurrency(contract?.monthlyRent || property?.currentRent || 1000)} EUROS (${contract?.monthlyRent || 1000} €).
El pago se realizará por meses anticipados dentro de los primeros ${contract?.paymentDay || 5} días de cada mes mediante transferencia bancaria o domiciliación en la cuenta corriente del arrendador:
IBAN: ${settings.landlordIban || '[IBAN Propietario]'}

CUARTA.- ACTUALIZACIÓN DE LA RENTA:
La renta convenida se actualizará en la fecha en que se cumpla cada año de vigencia del contrato, con arreglo a la variación anual determinada por la legislación estatal vigente en cada momento (Ley de Arrendamientos Urbanos y Ley por el Derecho a la Vivienda).

QUINTA.- FIANZA LEGAL Y GARANTÍAS ADICIONALES:
A la firma del presente contrato, el arrendatario hace entrega al arrendador en metálico de la suma de ${formatCurrency(contract?.deposit || contract?.monthlyRent || 1000)}, en concepto de fianza legal obligatoria equivalente a una mensualidad de renta (Art. 36 LAU), la cual será depositada preceptivamente en el organismo público autonómico competente.
${contract?.additionalDeposit ? `Asimismo, en concepto de garantía adicional, el arrendatario deposita la suma de ${formatCurrency(contract.additionalDeposit)}.` : ''}

SEXTA.- GASTOS GENERALES Y SUMINISTROS:
Los gastos de comunidad ordinarios y el Impuesto sobre Bienes Inmuebles (IBI) serán de cuenta de la parte arrendadora. Los gastos por servicios y consumos con contador individual (electricidad, agua, gas y telecomunicaciones) serán abonados íntegramente por la parte arrendataria.

SÉPTIMA.- CONSERVACIÓN Y REPARACIONES:
El arrendatario recibe la vivienda en perfecto estado de uso y conservación. Serán de cuenta del arrendador las reparaciones necesarias para conservar la vivienda en condiciones de habitabilidad, salvo las derivadas del uso ordinario o negligencia del arrendatario.

Y en prueba de plena conformidad, firman el presente contrato por duplicado en el lugar y fecha consignados en el encabezamiento.


_______________________________                _______________________________
EL ARRENDADOR                                  EL ARRENDATARIO
${settings.landlordName}                       ${tenant?.name || 'El Inquilino'}`;
    }
  },
  {
    id: 'requerimiento-pago',
    title: 'Requerimiento Previo de Pago de Rentas Vencidas',
    category: 'notificaciones',
    description: 'Aviso formal al inquilino concediendo plazo perentorio para liquidar rentas pendientes con carácter previo a acciones judiciales.',
    generate: (ctx) => {
      const { settings, property, tenant, customData } = ctx;
      const today = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
      const owedAmount = customData?.debtAmount || 1250;
      const debtDetails = customData?.debtDetails || 'Renta de arrendamiento mensual impagada a su vencimiento';

      return `REQUERIMIENTO FORMAL DE PAGO EXTRAJUDICIAL

En ${settings.landlordCity || 'Madrid'}, a ${today}.

REMITENTE:
${settings.landlordName}
NIF/CIF: ${settings.landlordNif}
Dirección: ${settings.landlordAddress}, ${settings.landlordPostalCode} ${settings.landlordCity}
Teléfono: ${settings.landlordPhone} / Email: ${settings.landlordEmail}

DESTINATARIO:
D./Dña. ${tenant?.name || '[Nombre Arrendatario]'}
NIF/NIE: ${tenant?.dniNie || '[DNI/NIE]'}
Domicilio arrendado: ${property?.address || '[Dirección Inmueble]'}, ${property?.city || ''}

ASUNTO: Reclamación extrajudicial fehaciente de pago de deudas derivadas de contrato de arrendamiento.

Muy Sr./Sra. nuestro/a:

Por medio de la presente comunicación, en mi calidad de arrendador del inmueble arriba reseñado, me pongo en contacto con usted a fin de requerirle formalmente el abono inmediato de las cantidades vencidas, líquidas y exigibles que a día de la fecha adeuda:

CONCEPTO DEL DÉBITO:
${debtDetails}
IMPORTE TOTAL RECLAMADO: ${formatCurrency(Number(owedAmount))}

A tal efecto, se le concede un PLAZO IMPRORROGABLE DE SIETE (7) DÍAS NATURALES contados desde la recepción de la presente para hacer efectivo el ingreso de la expresada cantidad en la cuenta bancaria de abono habitual:
IBAN: ${settings.landlordIban || '[IBAN Propietario]'}
Concepto: Liquidación Deuda Renta - ${tenant?.name || 'Inquilino'}

Le advertimos expresamente de que, en caso de desatender el presente requerimiento en el plazo señalado, se procederá sin más dilación al ejercicio de las acciones legales oportunas en vía judicial, instando la demanda de resolución de contrato por falta de pago y desahucio, con expresa imposición de las costas procesales a su cargo de conformidad con la Ley de Enjuiciamiento Civil.

Quedando a su entera disposición para resolver cualquier aclaración o verificar el justificante de abono, le saluda atentamente,


__________________________________________
${settings.landlordName}
NIF/CIF: ${settings.landlordNif}`;
    }
  }
];
