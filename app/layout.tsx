import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import './globals.css'
import { Quicksand } from 'next/font/google'

export const metadata: Metadata = {
  title: 'User Guide Portal',
  description: 'Standalone documentation portal for project user guides.'
}
const quicksand = Quicksand({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-quicksand',
  display: 'swap'
})
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={quicksand.variable} suppressHydrationWarning>
        <header className="topbar">
          <div className="container topbar-inner">
            <Link href="/user-guide" className="brand">
              <span className="brand-mark"><BookOpen size={22} /></span>
              <span>User Guide Portal</span>
            </Link>
            <Link href="/user-guide" className="nav-pill">Tất cả dự án</Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
