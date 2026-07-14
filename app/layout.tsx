import './globals.css'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata = {
  title: 'Workshop IA · LLM+Wiki',
  description: 'Implementación de referencia del patrón LLM+Wiki para el Taller IA (UAM Azcapotzalco)',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SiteHeader />
          <main className="container mx-auto px-4 py-6 max-w-6xl flex-1">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  )
}
