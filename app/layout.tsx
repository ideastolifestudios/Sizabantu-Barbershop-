import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sizabantu Barbershop",
  description: "Premium Grooming",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
