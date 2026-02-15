import { forwardRef } from 'react';
import { plans } from '../../data/plans';
import { formatMoney } from '../../utils/formatters';

// Icons
import cocheAzul from '../../assets/coche-azul.png';
import cocheRosa from '../../assets/coche-rosa.png';
import cocheRosaFooter from '../../assets/coche-rosa-2.png'; // Improved pink footer
import electrico from '../../assets/electrico.png';
import electricoFooter from '../../assets/electrico-3.png'; // Green footer
import llaveRosa from '../../assets/llave-rosa.png'; // Key icon

const PDFContent = forwardRef(function PDFContent(
  { planKey, clientData, vehicleData, calculatedData, amortizationTable, currency, method, scheduledPayments, user },
  ref
) {
  const config = plans[planKey];
  if (!config || !calculatedData) return null;

  const today = new Date().toLocaleDateString('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  // Select icon based on plan
  let planIcon = cocheAzul;
  let footerIcon = cocheAzul; // Default Footer (Blue)

  if (planKey.includes('pink')) {
    planIcon = cocheRosa;
    footerIcon = cocheRosaFooter;
  }
  if (planKey.includes('green') || planKey.includes('electrico')) {
    planIcon = electrico;
    footerIcon = electricoFooter;
  }
  
  // Headers colors match the plan color
  const headerStyle = {
    backgroundColor: config.color,
    color: 'white',
    padding: '2px 8px',
    fontWeight: 'bold',
    fontSize: '11px',
  };

  const cellStyle = {
    padding: '3px 8px',
    fontSize: '11px',
    borderBottom: '1px solid #eee',
  };

  const pageStyle = {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: 'white',
    boxSizing: 'border-box',
  };

  const getMethodLabel = (methodKey) => {
    if (config.isLeasing) return 'Arrendamiento Puro';
    switch (methodKey) {
      case 'french': return 'Saldos Insolutos';
      case 'level': return 'Cuota Nivelada';
      default: return 'Saldos Insolutos';
    }
  };

  const methodLabel = getMethodLabel(method);

  const InfoRow = () => (
    <tr style={{ backgroundColor: config.color, color: 'white' }}>
      <td style={{ padding: '4px 8px', fontWeight: 'bold', fontSize: '11px', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
        Moneda: {currency}
      </td>
      <td style={{ padding: '4px 8px', fontWeight: 'bold', fontSize: '11px', textAlign: 'right', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
        Método: {methodLabel}
      </td>
    </tr>
  );

  return (
    <div ref={ref}>
      {/* PAGE 1: Quote Summary */}
      <div style={pageStyle}>
        
        {/* 1. Header & Date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <img
            src="https://carmarketing.mx/wp-content/uploads/2023/10/carmarketing-blanco.jpeg"
            alt="Car Marketing"
            style={{ width: '180px' }}
          />
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: config.color }}>
            {today}
          </div>
        </div>

        {/* 2. Title */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: config.color, fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>
            {config.pdfTitle}
          </h2>
        </div>

        {/* 3. Greeting & Intro */}
        <div style={{ marginBottom: '20px', fontSize: '12px', color: '#333' }}>
          <p style={{ fontWeight: 'bold', color: config.color, marginBottom: '8px' }}>Estimado(a) Cliente:</p>
          <p style={{ lineHeight: '1.4' }}>
            Para nosotros es grato que nos haya elegido para la compra/renta de su auto a través de nuestro plan de
            <span style={{ fontWeight: 'bold', color: config.color }}> {config.title}</span>. 
            "Una decisión acertada para adquirir su vehículo con las mejores condiciones."
          </p>
        </div>

        {/* 4. Benefits List with Icons */}
        <div style={{ marginBottom: '25px', paddingLeft: '10px' }}>
          {config.benefits.map((benefit, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
              <img src={planIcon} alt="icon" style={{ width: '24px', marginRight: '10px' }} />
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#444' }}>{benefit}</span>
            </div>
          ))}
        </div>

        {/* 5. Vehicle Info Box (Green/Blue Header) */}
        <div style={{ marginBottom: '0', border: `1px solid ${config.color}`, borderBottom: 'none' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ backgroundColor: config.color, color: 'white' }}>
                <td style={{ padding: '4px 8px', width: '60%', fontWeight: 'bold', fontSize: '12px' }}>
                  Marca: {vehicleData.brand}
                </td>
                <td style={{ padding: '4px 8px', width: '40%', fontWeight: 'bold', fontSize: '12px', textAlign: 'right' }}>
                  Precio con IVA: {formatMoney(parseFloat(String(vehicleData.price).replace(/,/g, '')) || 0, currency)}
                </td>
              </tr>
              <tr style={{ backgroundColor: config.color, color: 'white' }}>
                <td colSpan="2" style={{ padding: '4px 8px', fontWeight: 'bold', fontSize: '12px', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
                  Vehículo {vehicleData.condition === 'new' ? 'Nuevo' : 'Seminuevo'} : {vehicleData.model} {vehicleData.year}
                </td>
              </tr>
              <InfoRow />
            </tbody>
          </table>
        </div>

        {/* 6. Financial Table (Data Grid) */}
        <div style={{ marginBottom: '20px', border: `1px solid ${config.color}`, borderTop: 'none' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              {/* Column Headers */}
              <tr style={{ borderBottom: `2px solid ${config.color}` }}>
                <th style={{ textAlign: 'left', padding: '6px 8px', color: config.color, width: '50%' }}>Concepto</th>
                <th style={{ textAlign: 'center', padding: '6px 8px', color: config.color, width: '50%', fontSize: '14px' }}>
                  {calculatedData.term} Meses
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Monthly Payment Row (Highlight) */}
              <tr style={{ backgroundColor: `${config.color}15`, borderBottom: `1px solid ${config.color}40` }}>
                <td style={{ padding: '6px 8px', fontWeight: 'bold', color: '#333' }}>
                  {config.isLeasing ? 'Renta Mensual con IVA' : 'Mensualidad con IVA'}
                </td>
                <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', color: config.color }}>
                  {formatMoney(calculatedData.monthlyPayment, currency)}
                </td>
              </tr>

              {/* Rate Row */}
              {!config.isLeasing && (
                 <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '4px 8px', color: '#666' }}>Tasa Anual de Interés Fija</td>
                  <td style={{ padding: '4px 8px', textAlign: 'center', fontWeight: 'bold', color: '#e11d48' }}>
                    {calculatedData.rate}%
                  </td>
                </tr>
              )}

              {/* Subheader: Integración Pago Inicial */}
              <tr>
                <td colSpan="2" style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: config.color, backgroundColor: '#f8fafc', borderTop: `1px solid ${config.color}40`, borderBottom: `1px solid ${config.color}40` }}>
                  Integración Pago Inicial
                </td>
              </tr>

              {/* Detailed Rows */}
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '4px 8px', color: '#333' }}>
                  {config.isLeasing ? 'Porcentaje Anticipo a Rentas' : 'Porcentaje de Enganche'}
                </td>
                <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                  {config.isLeasing 
                    ? `${((calculatedData.downPaymentAmount / calculatedData.amountToFinance) * 100).toFixed(0)}%` // Approx for leasing 
                    : (vehicleData.condition === 'new' ? ((calculatedData.downPaymentAmount / (parseFloat(String(vehicleData.price).replace(/,/g, '')) + parseFloat(String(vehicleData.accessories).replace(/,/g, '') || 0))) * 100).toFixed(2) + '%' : 'N/A')
                  }
                </td>
              </tr>

              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '4px 8px', color: '#333' }}>
                   {config.isLeasing ? 'Monto de Anticipo a Rentas' : 'Monto de Enganche'}
                </td>
                <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                  {formatMoney(calculatedData.downPaymentAmount, currency)}
                </td>
              </tr>

              {config.isLeasing && (
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '4px 8px', color: '#333' }}>1er Renta</td>
                  <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                    {formatMoney(calculatedData.monthlyPayment, currency)}
                  </td>
                </tr>
              )}

              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '4px 8px', color: '#333' }}>Comisión por Apertura</td>
                <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                  {formatMoney(calculatedData.comision, currency)}
                </td>
              </tr>

              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '4px 8px', color: '#333' }}>Seguro CONTADO (Aprox)</td>
                <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                  {formatMoney(calculatedData.seguro, currency)}
                </td>
              </tr>

              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '4px 8px', color: '#333' }}>Lo Jack (GPS)</td>
                <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                  {formatMoney(calculatedData.lojack, currency)}
                </td>
              </tr>

              {/* Total Row */}
              <tr style={{ backgroundColor: config.color, color: 'white' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Total Pago Inicial</td>
                <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                  {formatMoney(calculatedData.totalInitial, currency)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 7. Footer Disclaimers */}
        <div style={{ fontSize: '9px', color: '#555', lineHeight: '1.4', position: 'relative', minHeight: '80px', paddingTop: '10px' }}>
          <div style={{ width: '75%' }}>
            <p style={{ marginBottom: '4px' }}>*Importes más IVA donde se indican. No se incluyen costos de trámites vehiculares (se cotizan por separado).</p>
            <p style={{ marginBottom: '4px' }}>*Planes sujetos a cambio SIN PREVIO AVISO y sujetos a aprobación de crédito.</p>
            <p style={{ marginBottom: '4px' }}>*Seguro Anual de Contado Cobertura Amplia para USO PARTICULAR. Con Renovación Automática.</p>
            <p style={{ marginBottom: '4px' }}>*El precio del localizador contempla todo el plazo a contratar.</p>
            <p style={{ marginBottom: '4px' }}>*Existe la opción de adquirir el vehículo al finalizar el plazo.</p>
          </div>
          
          {/* Footer Icon */}
          <div style={{ position: 'absolute', right: '0', bottom: '0' }}>
            <img src={footerIcon} alt="Car Marketing" style={{ width: '120px' }} />
          </div>
        </div>
        
        {/* User Info */}
        {user?.name && (
          <div style={{ fontSize: '10px', color: '#666', marginTop: '10px', fontStyle: 'italic', textAlign: 'right' }}>
            Cotización realizada por: {user.name}
          </div>
        )}
        
        {/* Footer Branding Page 1 */}
        <div style={{ marginTop: 'auto', borderTop: '2px solid ' + config.color, paddingTop: '10px', fontSize: '10px', color: config.color }}>
          <p style={{ fontWeight: 'bold', fontSize: '12px' }}>Car Marketing México SA de CV</p>
          <p>Club de Golf México 48 Col. Arenal Tepepan, Tlalpan CDMX CP 14620</p>
          <p style={{ fontWeight: 'bold' }}>Tel: 55 2589 2843 <span style={{ float: 'right' }}>www.carmarketing.mx</span></p>
        </div>

      </div>

      {/* PAGE BREAK */}
      <div className="html2pdf__page-break"></div>

      {/* PAGE 2: Amortization Table */}
      <div style={pageStyle}>
        
        {/* Header Page 2 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <img
            src="https://carmarketing.mx/wp-content/uploads/2023/10/carmarketing-blanco.jpeg"
            alt="Car Marketing"
            style={{ width: '180px' }}
          />
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: config.color }}>
            {today}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: config.color, fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>
            TABLA DE AMORTIZACIÓN
          </h2>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>{config.title}</p>
          {user?.name && (
            <p style={{ fontSize: '10px', color: '#888', marginTop: '2px', fontStyle: 'italic' }}>
              Atendido por: {user.name}
            </p>
          )}
        </div>

        {/* Amortization Table (all months) */}
        {amortizationTable.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <table className="pdf-table" style={{ fontSize: '10px', width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: config.color, color: 'white' }}>
                  <th style={{ padding: '6px', textAlign: 'center' }}>No.</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Mensualidad</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Interés</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Capital</th>
                  {(calculatedData.scheduledPaymentsList?.length > 0) && (
                    <th style={{ padding: '6px', textAlign: 'right' }}>Abono Programado</th>
                  )}
                  <th style={{ padding: '6px', textAlign: 'right' }}>Saldo Insoluto</th>
                </tr>
              </thead>
              <tbody>
                {amortizationTable.map((row) => {
                  const extras = calculatedData.scheduledPaymentsList?.filter(p => p.monthIndex === row.month) || [];
                  const extraAmount = extras.reduce((sum, p) => sum + (parseFloat(p.amount?.replace(/,/g, '')) || 0), 0);
                  
                  return (
                    <tr key={row.month} style={{ borderBottom: '1px solid #eee', backgroundColor: extraAmount > 0 ? '#f0fdf4' : 'transparent' }}>
                      <td style={{ padding: '4px 6px', textAlign: 'center' }}>{row.month}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right' }}>{formatMoney(row.payment, currency)}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right' }}>{formatMoney(row.interest, currency)}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right' }}>{formatMoney(row.principal, currency)}</td>
                      {(calculatedData.scheduledPaymentsList?.length > 0) && (
                        <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: extraAmount > 0 ? 'bold' : 'normal', color: extraAmount > 0 ? '#16a34a' : 'inherit' }}>
                          {extraAmount > 0 ? formatMoney(extraAmount, currency) : '-'}
                        </td>
                      )}
                      <td style={{ padding: '4px 6px', textAlign: 'right' }}>{formatMoney(row.balance, currency)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Page 2 */}
        <div style={{ marginTop: '30px', borderTop: '2px solid ' + config.color, paddingTop: '10px', fontSize: '10px', color: config.color }}>
          <p style={{ fontWeight: 'bold', fontSize: '12px' }}>Car Marketing México SA de CV</p>
          <p>Club de Golf México 48 Col. Arenal Tepepan, Tlalpan CDMX CP 14620</p>
          <p style={{ fontWeight: 'bold' }}>Tel: 55 2589 2843 <span style={{ float: 'right' }}>www.carmarketing.mx</span></p>
        </div>
      </div>
    </div>
  );
});

export default PDFContent;
