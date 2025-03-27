// app/page.tsx (Home)
import Hero from "./components/Hero";
import ServicesPreview from "./components/ServicesPreview";
import AgendaPreview from "./components/AgendaPreview";
import PaymentsPreview from "./components/PaymentsPreview";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesPreview />
      <AgendaPreview />
      <PaymentsPreview />
    </>
  );
}