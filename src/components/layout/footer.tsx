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
    ]
  }

  return (
    <footer className="border-t border-subtle">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold">SeeZee Studio</span>
            </div>
            <p className="text-dim max-w-md">
              Building modern web applications with clean code and thoughtful design. 
              From concept to deployment, we deliver solutions that work.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <nav className="space-y-2">
              {navigation.main.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="link block"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <nav className="space-y-2">
              {navigation.legal.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="link block"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="separator mt-8 mb-6"></div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-dim text-sm">
            © {currentYear} SeeZee Studio. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-dim text-sm">Built with Next.js & Tailwind</span>
          </div>
        </div>
      </div>
    </footer>
  )
}