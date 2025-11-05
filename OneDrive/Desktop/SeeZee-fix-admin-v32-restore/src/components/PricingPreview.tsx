import React from 'react';
import Link from 'next/link';

export function PricingPreview() {
  const packages = [
    {
      name: 'Landing Page',
      price: '$2,500',
      features: [
        '5 custom sections',
        'Mobile responsive',
        '2-week delivery',
        'Basic SEO setup',
        '1 round of revisions'
      ],
      popular: false,
    },
    {
      name: 'Business Site',
      price: '$5,000',
      features: [
        '10+ custom sections',
        'CMS integration',
        'Contact forms',
        'Analytics setup',
        '3 rounds of revisions',
        'Advanced SEO'
      ],
      popular: true,
    },
    {
      name: 'Full Application',
      price: 'Custom',
      features: [
        'Custom functionality',
        'Database design',
        'User authentication',
        'Admin dashboard',
        'API integration',
        'Ongoing support'
      ],
      popular: false,
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Transparent Pricing
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            No hidden fees. No surprises. Just honest pricing for quality work.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg) => (
            <div 
              key={pkg.name}
              className={`seezee-glass p-8 rounded-xl border transition-all duration-300 hover:scale-105 ${
                pkg.popular 
                  ? 'border-cyan-400/50 shadow-lg shadow-cyan-500/20' 
                  : 'border-white/10'
              }`}
            >
              {pkg.popular && (
                <div className="inline-block px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-400 text-sm font-semibold mb-4">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold mb-2 text-white">{pkg.name}</h3>
              <div className="text-4xl font-bold mb-6 text-cyan-400">{pkg.price}</div>
              
              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-gray-300">
                    <span className="text-cyan-400 mt-1 flex-shrink-0">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link 
                href="/contact"
                className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition-all ${
                  pkg.popular
                    ? 'bg-cyan-400 text-black hover:bg-cyan-300'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link 
            href="/services" 
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            View all packages and services
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
