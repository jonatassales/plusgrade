import './globals.css'

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout(props: RootLayoutProps) {
  const { children } = props

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
