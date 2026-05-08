import { redirect } from "next/navigation";

// Redirect root to the existing barbershop homepage
// (or replace this with your main page component)
export default function Home() {
  return (
    <main>
      <h1>Sizabantu Barbershop OS</h1>
      <p>API is live. Use the booking and queue endpoints.</p>
    </main>
  );
}
