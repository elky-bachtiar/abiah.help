export interface Product {
  id: string;
  name: string;
  description: string;
  priceId: string;
  mode: 'subscription' | 'payment';
}

export const products: Product[] = [
  {
    id: 'prod_SYErF6jKMm5za2',
    name: 'Professional Advisory',
    description: 'Industry-specific expert AI mentor with deep regulatory and market knowledge. Unlimited mentorship access across all communication channels.',
    priceId: 'price_1Rd8O4D5a0uk1qUEb76A0qe2',
    mode: 'subscription'
  },
  {
    id: 'prod_SYErHkrTyiIAmi',
    name: 'Growth Accelerator',
    description: 'Strategic AI mentor for scaling your startup successfully. 8 × 45-minute video mentorship sessions per month.',
    priceId: 'price_1Rd8NmD5a0uk1qUEF5N4AXbq',
    mode: 'subscription'
  },
  {
    id: 'prod_SYErznlRJrJHln',
    name: 'Founder Essential',
    description: 'Your AI mentor who believes in you and guides you 24/7. 4 × 30-minute video mentorship sessions per month.',
    priceId: 'price_1Rd8NVD5a0uk1qUEQSEg8jCp',
    mode: 'subscription'
  }
];