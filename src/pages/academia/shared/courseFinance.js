/**
 * VAT-inclusive course finance split.
 * List price = what the learner pays. Fee and VAT are taken from that amount.
 *
 * Example (200):
 *   VAT = 200 × 18/118 = 30.51
 *   net after tax = 169.49
 *   platform = 20% × 169.49 = 33.90
 *   professor = 80% × 169.49 = 135.59
 */

export const SERVICE_FEE_RATE = 0.2;
export const VAT_RATE = 0.18;

export function roundMoney(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

/**
 * @param {number} listPrice - VAT-inclusive amount the learner pays (after discount)
 * @returns {{ total, vat, netAfterTax, serviceFee, professorShare }}
 */
export function splitCoursePayment(listPrice) {
  const total = roundMoney(Math.max(0, Number(listPrice) || 0));
  const vat = roundMoney(total * VAT_RATE / (1 + VAT_RATE));
  const netAfterTax = roundMoney(total - vat);
  const serviceFee = roundMoney(netAfterTax * SERVICE_FEE_RATE);
  const professorShare = roundMoney(netAfterTax - serviceFee);
  return { total, vat, netAfterTax, serviceFee, professorShare };
}

/** Professor net from stored invoice fields (prefers recomputation from total). */
export function professorNetFromInvoice({ total, amount_paid, vat, service_fee, fees_per_amount }) {
  const gross = Number(total ?? amount_paid);
  if (Number.isFinite(gross) && gross >= 0) {
    return splitCoursePayment(gross).professorShare;
  }
  const fee = Number(service_fee ?? fees_per_amount) || 0;
  const tax = Number(vat) || 0;
  const paid = Number(amount_paid ?? total) || 0;
  return roundMoney(paid - fee - tax);
}
