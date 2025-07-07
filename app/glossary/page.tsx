import glossaryData from '../../lib/glossary'

export default function GlossaryPage() {
  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-emerald-400">Glossary of Terms</h1>
        <p className="text-gray-300 mb-8">Explore key financial and real estate terms used throughout ChipEstate.</p>

        <div className="space-y-6">
          {glossary.map((entry, index) => (
            <div key={index} className="border border-white/10 rounded-lg p-5 bg-white/5 hover:bg-white/10 transition">
              <h2 className="text-xl font-semibold text-white mb-2">{entry.term}</h2>
              <p className="text-sm text-gray-300">{entry.definition}</p>
              {entry.formula && (
                <div className="mt-2 text-sm text-emerald-300">
                  <strong>Formula:</strong> {entry.formula}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center border-t border-white/10 pt-6">
          <p className="text-gray-300">
            Don’t see a term, or have some questions?{' '}
            <a href="/contact" className="text-emerald-400 underline hover:text-emerald-300">
              Contact Us
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
