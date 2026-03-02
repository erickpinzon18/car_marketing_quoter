import { useMemo } from 'react';
import { generateAmortizationTable, calculateCAT } from '../utils/amortization';
import { plans } from '../data/plans';

export function useCalculations({
  planKey,
  vehiclePrice,
  accessoriesPrice = 0,
  term,
  downPercent,
  rate,
  method,
  currency,
  scheduledPayments = [],
  exchangeRates = { USD: 19.5, MXN: 1 },
  promotion = null,
}) {
  return useMemo(() => {
    const config = plans[planKey];
    if (!config) return { calculatedData: {}, amortizationTable: [] };

    const scheduledPaymentsTotal = scheduledPayments.reduce((sum, p) => sum + (parseFloat(p.amount?.replace(/,/g, '')) || 0), 0);

    const totalPrice = vehiclePrice + accessoriesPrice;
    const downPaymentAmount = totalPrice * (downPercent / 100);
    let amountToFinance = totalPrice - downPaymentAmount - scheduledPaymentsTotal;
    if (amountToFinance < 0) amountToFinance = 0;

    // Apply promotion overrides
    let actualRate = rate;
    if (promotion && promotion.tasa !== undefined && promotion.tasa !== null && promotion.tasa !== '') {
      actualRate = parseFloat(promotion.tasa);
    }

    let comisionPct = config.isLeasing ? 3 : 1; // Default
    if (promotion && promotion.comisionApertura !== undefined && promotion.comisionApertura !== null && promotion.comisionApertura !== '') {
      comisionPct = parseFloat(promotion.comisionApertura);
    }

    const comision = totalPrice * (comisionPct / 100);
    const seguro = totalPrice * 0.0234;

    let lojack = 10805.4;
    if (currency === 'USD') lojack = lojack / (exchangeRates.USD || 19.5);
    if (planKey.includes('green') || planKey.includes('moto')) lojack = 0;

    const amortizationTable = generateAmortizationTable(
      amountToFinance,
      actualRate,
      term,
      method
    );

    let monthlyPayment = 0;
    if (amortizationTable.length > 0) {
      monthlyPayment = amortizationTable[0].payment;
    }

    // Process scheduled payments for PDF (map to approx month)
    const today = new Date();
    const processedScheduledPayments = scheduledPayments.map(p => {
        if (!p.date) return { ...p, monthIndex: 0 };
        const pDate = new Date(p.date + 'T00:00:00');
        // Simple month diff
        const diff = (pDate.getFullYear() - today.getFullYear()) * 12 + (pDate.getMonth() - today.getMonth());
        return { ...p, monthIndex: diff <= 0 ? 1 : diff };
    });

    let totalInitial = downPaymentAmount + comision + seguro + lojack;
    if (config.isLeasing) {
      totalInitial += monthlyPayment * 2;
    }

    // Banxico CAT: The upfront charges you pay to get the credit (not financed part)
    const upfrontCharges = comision + seguro + lojack;
    const cat = calculateCAT(amountToFinance, upfrontCharges, amortizationTable, processedScheduledPayments);

    const calculatedData = {
      monthlyPayment,
      downPaymentAmount,
      comision,
      seguro,
      lojack,
      totalInitial,
      amountToFinance,
      cat,
      rate: actualRate,
      originalRate: rate,
      term,
      totalScheduled: scheduledPaymentsTotal,
      scheduledPaymentsList: processedScheduledPayments,
      method,
      appliedPromotionId: promotion?.id || null,
    };

    return { calculatedData, amortizationTable };
  }, [
    planKey, vehiclePrice, accessoriesPrice, term, downPercent,
    rate, method, currency, scheduledPayments, exchangeRates, promotion,
  ]);
}
