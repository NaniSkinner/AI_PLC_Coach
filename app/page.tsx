export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-st-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-heading font-bold text-st-blue-primary mb-4">
            AI-Powered PLC Virtual Coach
          </h1>
          <p className="text-xl text-st-gray-700 mb-8">
            Expert guidance for Professional Learning Communities
          </p>
          <div className="inline-block bg-st-orange text-white px-6 py-3 rounded-lg">
            Phase 1 in Progress
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-heading font-semibold text-st-blue-primary mb-2 text-lg">
              Framework-Grounded
            </h3>
            <p className="text-st-gray-600">
              Built on Solution Tree's Three Big Ideas and Four Critical Questions
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-heading font-semibold text-st-blue-primary mb-2 text-lg">
              Citation-Backed
            </h3>
            <p className="text-st-gray-600">
              Every response includes specific references to authoritative sources
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-heading font-semibold text-st-blue-primary mb-2 text-lg">
              Inquiry-Based
            </h3>
            <p className="text-st-gray-600">
              Facilitative coaching through powerful questions
            </p>
          </div>
        </div>

        <div className="mt-16 text-center text-sm text-st-gray-500">
          <p>Phase 1: Foundation Setup In Progress</p>
          <p className="mt-2">Next.js 14 • TypeScript • Tailwind CSS</p>
        </div>
      </div>
    </main>
  );
}
