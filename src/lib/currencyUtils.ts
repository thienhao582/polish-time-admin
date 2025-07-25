// Currency formatting utilities
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatCurrencyVN = (amount: number): string => {
  // For Vietnamese locale but still USD currency
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Parse price from various formats to number
export const parsePrice = (priceString: string): number => {
  if (typeof priceString === 'number') return priceString;
  
  // Remove all non-digit characters except decimal point
  const cleaned = priceString.toString().replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
};

// Convert VND to USD (temporary helper for migration)
export const convertVNDtoUSD = (vndAmount: number): number => {
  // Approximate conversion rate (1 USD = 24,000 VND)
  return vndAmount / 24000;
};