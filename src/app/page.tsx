import { VitalsDashboard } from '@/components/VitalsDashboard';

export default function HomePage() {
  return (
    <main className="shell">
      <header className="top">
        <div>
          <h1>Web Vitals Lab</h1>
          <p className="lede">
            Лаборатория frontend observability: сбор LCP, INP и CLS, structured log и сквозной correlation id.
            Это публичное демо, не продукт работодателя.
          </p>
        </div>
      </header>
      <VitalsDashboard />
    </main>
  );
}
