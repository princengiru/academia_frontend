import { useState, useEffect } from 'react';
import hoausflag from '../assets/icons/hoausflag.svg';
import rwanda from '../assets/icons/rwanda.svg';

// Global state variables
let globalExchangeRate = 1350;
let globalCurrency = { label: 'RWF', flag: rwanda };
let isFetching = false;
let hasFetched = false;

// Event listeners for state changes
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach(listener => listener({ exchangeRate: globalExchangeRate, currency: globalCurrency }));
};

const fetchExchangeRate = async () => {
  if (hasFetched || isFetching) return;
  isFetching = true;
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/RWF');
    const data = await res.json();
    if (data && data.rates && data.rates.USD) {
      globalExchangeRate = 1 / data.rates.USD;
      hasFetched = true;
      notifyListeners();
    }
  } catch (err) {
    console.error("Failed to fetch exchange rate", err);
  } finally {
    isFetching = false;
  }
};

export const flagOptions = [
  { label: 'RWF', flag: rwanda },
  { label: 'USD', flag: hoausflag },
];

export const useCurrency = () => {
  const [state, setState] = useState({ exchangeRate: globalExchangeRate, currency: globalCurrency });

  useEffect(() => {
    fetchExchangeRate();

    const listener = (newState) => setState(newState);
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const setCurrency = (option) => {
    globalCurrency = option;
    notifyListeners();
  };

  const formatAmount = (baseAmountRWF, specificCurrencyLabel = null) => {
    const targetCurrency = specificCurrencyLabel || state.currency.label;
    
    // Attempt to parse string to number if needed (e.g. "222.3 USD" -> 222.3)
    let numericAmount = baseAmountRWF;
    if (typeof baseAmountRWF === 'string') {
        const cleaned = baseAmountRWF.replace(/[^\d.-]/g, '');
        numericAmount = parseFloat(cleaned);
        if (isNaN(numericAmount)) return baseAmountRWF; // Return as-is if unparseable like "---"
        
        // If the original string was USD, we need to convert it BACK to RWF as the base first.
        // Assuming all static data in the platform is currently hardcoded as USD in the mock arrays except for stats cards
        if (baseAmountRWF.includes('USD')) {
            numericAmount = numericAmount * state.exchangeRate;
        } else if (baseAmountRWF.includes('K') || baseAmountRWF.includes('M')) {
            // Very naive parsing for "2.8K" or "19.3M"
            let multiplier = 1;
            if (baseAmountRWF.includes('K')) multiplier = 1000;
            if (baseAmountRWF.includes('M')) multiplier = 1000000;
            numericAmount = numericAmount * multiplier;
            if (baseAmountRWF.includes('USD')) {
                numericAmount = numericAmount * state.exchangeRate;
            }
        }
    }

    if (targetCurrency === 'USD') {
      const amountUSD = numericAmount / state.exchangeRate;
      if (amountUSD >= 1000000) return `${(amountUSD / 1000000).toFixed(1)}M USD`;
      if (amountUSD >= 1000) return `${(amountUSD / 1000).toFixed(1)}K USD`;
      
      // Remove decimals if it's a whole number
      return amountUSD % 1 === 0 ? `${amountUSD} USD` : `${amountUSD.toFixed(2)} USD`;
    }
    
    if (numericAmount >= 1000000) return `${(numericAmount / 1000000).toFixed(1)}M RWF`;
    if (numericAmount >= 1000) return `${(numericAmount / 1000).toFixed(1)}K RWF`;
    
    return numericAmount % 1 === 0 ? `${numericAmount} RWF` : `${numericAmount.toFixed(2)} RWF`;
  };

  // Specialized formatter to handle things like "2,340,044" that might be raw numbers with commas
  const formatRaw = (baseAmountRWF) => {
      let num = typeof baseAmountRWF === 'string' ? parseFloat(baseAmountRWF.replace(/,/g, '')) : baseAmountRWF;
      if (isNaN(num)) return baseAmountRWF;
      
      if (state.currency.label === 'USD') {
          const amountUSD = num / state.exchangeRate;
          if (amountUSD >= 1000000) return `${(amountUSD / 1000000).toFixed(1)}M`;
          if (amountUSD >= 1000) return `${(amountUSD / 1000).toFixed(1)}K`;
          return amountUSD % 1 === 0 ? `${amountUSD}` : `${amountUSD.toFixed(2)}`;
      }
      
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return num.toLocaleString();
  };

  return {
    exchangeRate: state.exchangeRate,
    currency: state.currency,
    setCurrency,
    formatAmount,
    formatRaw
  };
};
