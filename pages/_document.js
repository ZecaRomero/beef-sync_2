import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        {/* Favicon e ícones do sistema */}
        <link rel="icon" type="image/x-icon" href="/Host_ico_rede.ico" />
        <link rel="shortcut icon" type="image/x-icon" href="/Host_ico_rede.ico" />
        
        {/* Ícones para diferentes dispositivos */}
        <link rel="apple-touch-icon" href="/Host_ico_rede.ico" />
        <link rel="icon" type="image/x-icon" sizes="16x16" href="/Host_ico_rede.ico" />
        <link rel="icon" type="image/x-icon" sizes="32x32" href="/Host_ico_rede.ico" />
        
        {/* Meta tags */}
        <meta name="description" content="Beef-Sync - Sistema de Gestão Pecuária" />
        <meta name="keywords" content="pecuária, gestão, bovinos, rebanho, beef sync" />
        <meta name="author" content="Beef-Sync" />
        
        {/* PWA Meta tags */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="application-name" content="Beef-Sync" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Beef-Sync" />
        
        {/* Preload de fontes importantes */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}