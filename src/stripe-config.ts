export interface Product {
  id: string;
  name: string;
  description: string;
  priceId: string;
  yearlyPriceId?: string;
  mode: 'subscription' | 'payment';
}

export const products: Product[] = [
  {
    id: 'prod_SYErznlRJrJHln', // Founder Essential
    name: 'Founder Essential',
    description: 'Perfect for getting started with AI mentorship. 2 × 20-minute video sessions (40 minutes total).',
    priceId: 'price_1Rd8NVD5a0uk1qUEQSEg8jCp',
    yearlyPriceId: 'price_1Rd8NVD5a0uk1qUEQSEg8jCp_yearly',
    mode: 'subscription'
  },
  {
    id: 'prod_SYZzwqHSFjVPjm', // Founder Companion
    name: 'Founder Companion',
    description: 'Your trusted AI mentor for critical decisions. 3 × 25-minute video sessions (75 minutes total).',
    priceId: 'price_1Rd8NmD5a0uk1qUEF5N4AXbq',
    yearlyPriceId: 'price_1Rd8NmD5a0uk1qUEF5N4AXbq_yearly',
    mode: 'subscription'
  },
  {
    id: 'prod_SYErHkrTyiIAmi', // Growth Partner
    name: 'Growth Partner',
    description: 'Strategic AI mentorship for scaling startups. 5 × 30-minute video sessions (150 minutes total).',
    priceId: 'price_1Rd8O4D5a0uk1qUEb76A0qe2',
    yearlyPriceId: 'price_1Rd8O4D5a0uk1qUEb76A0qe2_yearly',
    mode: 'subscription'
  },
  {
    id: 'prod_SYErF6jKMm5za2', // Expert Advisor
    name: 'Expert Advisor',
    description: 'Your personal AI advisory board. 8 × 30-minute video sessions (240 minutes total).',
    priceId: 'price_1Rd8OKD5a0uk1qUEXnVvuqO9',
    yearlyPriceId: 'price_1Rd8OKD5a0uk1qUEXnVvuqO9_yearly',
    mode: 'subscription'
  },
];