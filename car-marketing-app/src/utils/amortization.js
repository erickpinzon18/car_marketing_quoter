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

export function calculateCAT(rate, comisionPct, term) {
  const monthlyRate = rate / 100 / 12;
  const effectiveAnnualRate = Math.pow(1 + monthlyRate, 12) - 1;
  const annualizedCommission = (comisionPct / 100) * (12 / term);
  return ((effectiveAnnualRate + annualizedCommission) * 100).toFixed(2);
}
