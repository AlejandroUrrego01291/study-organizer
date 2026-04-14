import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { Toaster } from "react-hot-toast"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Study Organizer",
  description: "Organiza y monitorea tu progreso de estudio",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
    shortcut: "/icon-192.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/icon-192.png" sizes="192x192" type="image/png" />
      </head>
      <body className={geist.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}