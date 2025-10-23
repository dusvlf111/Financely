export default function Head() {
  return (
    <>
      {/* PWA Manifest */}
  <link rel="manifest" href="/manifest.json?v=20251024-1" />
      {/* Theme Color for address bar styling */}
      <meta name="theme-color" content="#10B981" />

      {/* Icons */}
      <link rel="icon" href="/favicon/favicon-32x32.png" sizes="32x32" type="image/png" />
      <link rel="icon" href="/favicon/favicon-16x16.png" sizes="16x16" type="image/png" />
      <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" />

      {/* Mobile meta */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Financely" />
    </>
  )
}
