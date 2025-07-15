'use client'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-blue-950 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Welcome to ChipEstate</h1>
          <p className="text-lg text-emerald-300">
            The future of real estate investing is fractional, accessible, and community-driven.
          </p>
        </div>

        {/* Origin Story */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-emerald-400">How It All Began</h2>
          <p>
            ChipEstate was born from a simple idea: real estate shouldn’t be reserved for the wealthy. Our founder, like many others,
            watched from the sidelines as housing prices soared out of reach. But instead of giving up, he built a platform where anyone
            — from students to seasoned investors — could buy fractional shares in income-generating properties.
          </p>
          <p>
            With a vision rooted in fairness and powered by modern tech, ChipEstate gives everyone a chance to earn passive income,
            build wealth, and take control of their financial future.
          </p>
        </section>

        {/* Unique Features */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-emerald-400">What Makes Us Different</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <span className="font-semibold text-emerald-300">🏅 Badges for Milestones:</span> Earn custom ChipEstate badges
              as you grow your portfolio — from First-Time Buyer to Chip Mogul.
            </li>
            <li>
              <span className="font-semibold text-emerald-300">🗳️ Sharer Voting Power:</span> Investors aren’t just passive spectators.
              Chip holders vote on major property decisions, from lease renewals to reserve balances.
            </li>
            <li>
              <span className="font-semibold text-emerald-300">🔍 Total Transparency:</span> Real performance metrics, not hype.
              Track property earnings, vacancy rates, reserve balances, and more.
            </li>
            <li>
              <span className="font-semibold text-emerald-300">🌱 Grow at Your Own Pace:</span> Buy chips for as little as $50. Build your
              stake one chip at a time.
            </li>
          </ul>
        </section>

        {/* Empowerment Callout */}
        <section className="bg-blue-900 border border-emerald-600 rounded p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-2 text-center text-emerald-300">Your Wealth. Your Vote. Your Future.</h2>
          <p className="text-center text-gray-300">
            We believe that financial power belongs in the hands of people — not institutions. ChipEstate is more than a platform.
            It’s a movement to democratize real estate and let everyday investors shape the future.
          </p>
        </section>

        {/* CTA */}
        <div className="text-center pt-6">
          <h3 className="text-xl font-semibold text-emerald-400 mb-2">Ready to Own Your First Chip?</h3>
          <p className="mb-4 text-gray-300">Sign up in under 2 minutes and start building your real estate portfolio today.</p>
          <a
            href="/register"
            className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded shadow"
          >
            Get Started
          </a>
        </div>
      </div>

      {/* Step Indicator Footer */}
      <div className="text-center text-xs text-gray-500 mt-12">ChipEstate | Built for the 99%</div>
    </main>
  )
}
