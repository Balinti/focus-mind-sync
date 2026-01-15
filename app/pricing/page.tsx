import { PricingTable } from '@/components/PricingTable'

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Start free, upgrade when you&apos;re ready
        </p>
      </div>

      <PricingTable />
    </div>
  )
}
