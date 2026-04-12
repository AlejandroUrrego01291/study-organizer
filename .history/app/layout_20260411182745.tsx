import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { Toaster } from "react-hot-toast"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Study Organizer",
  description: "Organiza y monitorea tu progreso de estudio",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={geist.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}