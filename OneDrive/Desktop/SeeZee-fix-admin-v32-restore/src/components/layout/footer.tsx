import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const navigation = {
    main: [
      { name: 'Services', href: '/services' },
      { name: 'Work', href: '/work' },
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/legal/privacy' },
      { name: 'Terms of Service', href: '/legal/terms' },
    ],
    social: [
      { name: 'GitHub', href: 'https://github.com' },
      { name: 'LinkedIn', href: 'https://linkedin.com' },
      { name: 'Twitter', href: 'https://twitter.com' },
    ]
  }

  return (
    <footer className="relative mt-16 bg-slate-900/80 backdrop-blur-xl border-t border-white/10">
      {/* Gradient separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      
      <div className="container-custom pt-24 pb-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          {/* Brand section */}
          <div className="md:col-span-5 mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl blur-lg opacity-50" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-xl">S</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  SEEZEE
                </h3>
                <p className="text-xs text-slate-400 font-medium tracking-wider">STUDIO</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-6">
              Crafting digital experiences with precision and artistry. We transform ideas into powerful web solutions that captivate and perform.
            </p>
            
            {/* Social links */}
            <div className="flex gap-3">
              {navigation.social.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 group"
                >
                  <span className="text-xs text-slate-400 group-hover:text-purple-400 transition-colors">
                    {item.name[0]}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation columns */}
          <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 mt-8">
            {/* Main nav */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Navigate</h4>
              <nav className="space-y-3">
                {navigation.main.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block text-slate-400 text-sm hover:text-purple-400 transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
              <nav className="space-y-3">
                {navigation.legal.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block text-slate-400 text-sm hover:text-purple-400 transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Contact CTA */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Get Started</h4>
              <Link
                href="/contact"
                className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-sm font-semibold hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300"
              >
                Let's Talk
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-12 pb-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © {currentYear} SeeZee Studio. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Next.js 15
              </span>
              <span>•</span>
              <span>Tailwind CSS</span>
              <span>•</span>
              <span>TypeScript</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}