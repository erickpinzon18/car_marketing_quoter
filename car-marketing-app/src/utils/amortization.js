export function generateAmortizationTable(principal, annualRate, months, method) {
  const table = [];
  const monthlyRate = annualRate / 100 / 12;

  if (annualRate === 0) {
    const monthlyPayment = principal / months;
    let balance = principal;
    for (let i = 1; i <= months; i++) {
      balance -= monthlyPayment;
      table.push({
        month: i,
        payment: monthlyPayment,
        principal: monthlyPayment,
        interest: 0,
        balance: Math.max(0, balance),
      });
    }
  } else if (method === 'german') {
    const fixedPrincipal = principal / months;
    let balance = principal;
    for (let i = 1; i <= months; i++) {
      const interest = balance * monthlyRate;
      const payment = fixedPrincipal + interest;
      balance -= fixedPrincipal;
      table.push({
        month: i,
        payment,
        principal: fixedPrincipal,
        interest,
        balance: Math.max(0, balance),
      });
    }
  } else {
    // French (default): fixed payment
    const payment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
      (Math.pow(1 + monthlyRate, months) - 1);
    let balance = principal;
    for (let i = 1; i <= months; i++) {
      const interest = balance * monthlyRate;
      const principalPart = payment - interest;
      balance -= principalPart;
      table.push({
        month: i,
        payment,
        principal: principalPart,
        interest,
        balance: Math.max(0, balance),
      });
    }
  }
  return table;
}

export function calculateCAT(amountToFinance, upfrontCharges, amortizationTable, scheduledPaymentsList = []) {
  if (!amountToFinance || amountToFinance <= 0) return 0;
  
  const maxMonth = Math.max(
    amortizationTable.length,
    ...scheduledPaymentsList.map(p => p.monthIndex || 0),
    0
  );
  if (maxMonth === 0) return 0;

  const cashFlows = new Array(maxMonth + 1).fill(0);
  
  // At t=0, the user "receives" the amount to finance, but immediately pays upfront charges (comission, insurance, GPS).
  cashFlows[0] = amountToFinance - upfrontCharges;

  // t=1..N payments from normal amortization
  for (const row of amortizationTable) {
    if (row.month <= maxMonth) {
      cashFlows[row.month] -= row.payment;
    }
  }

  // Account for scheduled / sporadic payments
  for (const sp of scheduledPaymentsList) {
    const val = parseFloat(sp.amount?.toString().replace(/,/g, '')) || 0;
    if (val > 0 && sp.monthIndex > 0 && sp.monthIndex <= maxMonth) {
      cashFlows[sp.monthIndex] -= val;
    }
  }

  // Newton-Raphson approximation for Internal Rate of Return (IRR)
  let rate = 0.05; // Initial guess 5% monthly
  let iterations = 0;
  let pb = 0;

  do {
    let npv = 0;
    let dNpv = 0;
    for (let t = 0; t <= maxMonth; t++) {
      npv += cashFlows[t] / Math.pow(1 + rate, t);
      if (t > 0) dNpv -= t * cashFlows[t] / Math.pow(1 + rate, t + 1);
    }
    
    if (Math.abs(dNpv) < 1e-6) break;
    
    const newRate = rate - npv / dNpv;
    pb = Math.abs(newRate - rate);
    rate = newRate;
    iterations++;
  } while (pb > 1e-7 && iterations < 100);

  if (iterations >= 100 || rate < -0.999 || isNaN(rate)) {
    return 0; // Did not converge
  }

  // Convert monthly IRR to effective annual rate (CAT)
  const catAnnual = Math.pow(1 + rate, 12) - 1;
  return (catAnnual * 100).toFixed(1);
}
