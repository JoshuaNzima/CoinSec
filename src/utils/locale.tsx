// Locale and currency configuration for Malawi
export const localeConfig = {
  currency: 'MWK',
  currencySymbol: 'MK',
  currencyCode: 'MWK',
  locale: 'en-MW', // English (Malawi)
  country: 'MW',
  countryName: 'Malawi',
  timezone: 'Africa/Blantyre'
};

// Currency conversion rates (approximate, for demo purposes)
// 1 USD ≈ 1,030 MWK (as of 2024)
export const exchangeRates = {
  USD_TO_MWK: 1030,
  MWK_TO_USD: 0.00097
};

// Format currency for Malawi
export function formatMalawianCurrency(amount: number, showSymbol: boolean = true): string {
  try {
    // Try to use Malawian locale first, fallback to en-US if not supported
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    const formattedNumber = formatter.format(amount);
    
    if (showSymbol) {
      return `MK${formattedNumber}`;
    } else {
      return formattedNumber;
    }
  } catch (error) {
    // Fallback to basic formatting
    const formattedNumber = amount.toLocaleString('en-US');
    return showSymbol ? `MK${formattedNumber}` : formattedNumber;
  }
}

// Convert USD amounts to MWK (for existing data)
export function convertUSDToMWK(usdAmount: number): number {
  return Math.round(usdAmount * exchangeRates.USD_TO_MWK);
}

// Format large numbers with K, M suffix in Malawian context
export function formatCompactCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `MK${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `MK${(amount / 1000).toFixed(0)}K`;
  } else {
    return `MK${amount.toLocaleString()}`;
  }
}

// Date formatting for Malawi
export function formatMalawianDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    // Fallback to basic date string
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toDateString();
  }
}

// Time formatting for Malawi
export function formatMalawianTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    // Fallback to basic time string
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString();
  }
}

// Phone number formatting for Malawi
export function formatMalawianPhone(phone: string): string {
  // Malawian phone numbers: +265 XXX XXX XXX or 0XXX XXX XXX
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('265')) {
    // International format
    const number = cleaned.substring(3);
    return `+265 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
  } else if (cleaned.startsWith('0')) {
    // Local format
    return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
  }
  
  return phone; // Return original if doesn't match expected format
}

// Sample Malawian locations for demo data
export const malawianLocations = {
  cities: [
    'Lilongwe', 'Blantyre', 'Mzuzu', 'Zomba', 'Kasungu', 
    'Mangochi', 'Karonga', 'Salima', 'Balaka', 'Dedza'
  ],
  districts: [
    'Lilongwe District', 'Blantyre District', 'Mzuzu District',
    'Zomba District', 'Kasungu District', 'Mangochi District'
  ],
  sampleAddresses: [
    'Area 10, Lilongwe',
    'Limbe, Blantyre',
    'Old Town, Lilongwe',
    'Chichiri, Blantyre',
    'Mzimba, Mzuzu',
    'Zomba Plateau, Zomba'
  ]
};

// Malawian business context
export const businessContext = {
  businessHours: '08:00 - 17:00',
  businessDays: 'Monday - Friday',
  publicHolidays: [
    'New Year\'s Day',
    'Chilembwe Day',
    'Martyrs\' Day',
    'Labour Day',
    'Kamuzu Day',
    'Independence Day',
    'Mother\'s Day',
    'Christmas Day',
    'Boxing Day'
  ],
  commonIndustries: [
    'Agriculture',
    'Manufacturing',
    'Mining',
    'Tourism',
    'Banking',
    'Healthcare',
    'Education',
    'Government'
  ]
};