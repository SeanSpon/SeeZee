import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import "../styles/studio.css";
import { Providers } from "./providers";
import DebugHUD from "../components/ui/debug-hud";
import { ClientAnimations } from "../components/ui/client-animations";
import SidebarWrapper from "../components/shared/SidebarWrapper";
import { Toaster } from "../components/ui/toaster";
import { PasswordSetupPrompt } from "../components/PasswordSetupPrompt";
import { CookieConsent } from "../components/shared/CookieConsent";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://seezeestudios.com"),
  title: {
    default: "SeeZee Studios | Web Design & Development in Louisville",
    template: "%s | SeeZee Studios",
  },
  description:
    "Custom websites, web applications, and practical automation for businesses and nonprofits. SeeZee Studios is based in Louisville, Kentucky.",
  applicationName: "SeeZee Studios",
  creator: "SeeZee Studios",
  publisher: "SeeZee Studios",
  authors: [{ name: "SeeZee Studios", url: "https://seezeestudios.com" }],
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SeeZee Studios",
    title: "SeeZee Studios | Web Design & Development in Louisville",
    description:
      "Thoughtful websites. Useful systems. Built in Louisville, Kentucky.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "SeeZee Studios — Websites that mean business.",
      },
    ],
  },
  twitter: { card: "summary_large_image", images: ["/opengraph-image"] },
  robots: { index: true, follow: true },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION || "" },
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schemaOrg = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://seezeestudios.com/#organization",
        name: "SeeZee Studios",
        alternateName: "SeeZee",
        url: "https://seezeestudios.com",
        logo: "https://seezeestudios.com/icon.png",
        description:
          "A Louisville web design and software studio building websites, web applications, and practical automation for businesses and nonprofits.",
        email: "contact@seezeestudios.com",
        telephone: "+15024352986",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Louisville",
          addressRegion: "KY",
          addressCountry: "US",
        },
        founder: [
          { "@type": "Person", name: "Sean McCulloch" },
          { "@type": "Person", name: "Zach Robards" },
        ],
        sameAs: [
          "https://github.com/SeanSpon",
          "https://www.linkedin.com/in/sean-mcculloch-58a3761a9/",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://seezeestudios.com/#website",
        url: "https://seezeestudios.com",
        name: "SeeZee Studios",
        publisher: { "@id": "https://seezeestudios.com/#organization" },
      },
    ],
  };

  return (
    <html
      lang="en"
      className="scroll-smooth"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Flash-prevention: apply theme/preferences before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var mode = localStorage.getItem('themeMode');
                  var theme = localStorage.getItem('theme');
                  var resolved = 'dark';
                  if (mode === 'system') {
                    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  } else if (mode === 'light' || mode === 'dark') {
                    resolved = mode;
                  } else if (theme === 'light' || theme === 'dark') {
                    resolved = theme;
                  }
                  document.documentElement.classList.add(resolved);
                  if (resolved === 'dark') document.documentElement.classList.remove('light');
                  else document.documentElement.classList.remove('dark');

                  if (localStorage.getItem('reduceAnimations') === 'true') {
                    document.documentElement.setAttribute('data-reduce-motion', 'true');
                  }
                  if (localStorage.getItem('compactMode') === 'true') {
                    document.documentElement.setAttribute('data-density', 'compact');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#dc2626" />

        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-0KV89H26Z9"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-0KV89H26Z9');
            `,
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {/* Check if user needs to set password (OAuth-only users) */}
          <PasswordSetupPrompt />

          {/* Sidebar and content wrapper */}
          <SidebarWrapper>{children}</SidebarWrapper>

          <ClientAnimations />
          {process.env.NODE_ENV === "development" && <DebugHUD />}
          <Toaster />
          <CookieConsent />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
