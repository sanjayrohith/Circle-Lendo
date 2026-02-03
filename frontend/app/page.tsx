"use client";

import { CreditScoreCard } from "@/components/CreditScoreCard";
import { useAccount } from "wagmi";
import Link from "next/link";

export default function HomePage() {
  const { isConnected } = useAccount();

  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-40 h-40 w-40 rounded-full bg-emerald-400/25 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center mb-12">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
              Credit-native communities
            </span>
            <h1 className="headline-font text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 mt-6">
              Build trust, grow access, and power lending circles on CreditCoin.
            </h1>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Join transparent lending circles, earn stronger credit scores, and unlock community
              funding with a protocol that rewards consistency.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/circles"
                className="px-6 py-3 rounded-full bg-slate-900 text-white font-medium shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition"
              >
                Explore Circles
              </Link>
              {isConnected ? (
                <Link
                  href="/create"
                  className="px-6 py-3 rounded-full border border-slate-200 bg-white/80 text-slate-700 font-medium hover:bg-white transition"
                >
                  Create a Circle
                </Link>
              ) : (
                <span className="px-6 py-3 rounded-full border border-slate-200 bg-white/70 text-slate-500 font-medium">
                  Connect wallet to start
                </span>
              )}
            </div>
          </div>

          <div className="space-y-5">
            {!isConnected && (
              <div className="glass-card rounded-2xl p-5">
                <h2 className="headline-font text-lg font-semibold text-slate-900 mb-2">
                  Connect your wallet
                </h2>
                <p className="text-sm text-slate-600">
                  See your credit score, join circles, and start building on-chain reputation.
                </p>
              </div>
            )}

            <CreditScoreCard />

            <div className="glass-card rounded-2xl p-6">
              <h3 className="headline-font text-base font-semibold text-slate-900 mb-4">
                Quick actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/circles"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium text-center shadow-sm hover:bg-blue-700 transition"
                >
                  Browse Circles
                </Link>
                {isConnected ? (
                  <>
                    <Link
                      href="/create"
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium text-center shadow-sm hover:bg-emerald-600 transition"
                    >
                      Create Circle
                    </Link>
                    <Link
                      href="/profile"
                      className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium text-center hover:bg-slate-50 transition"
                    >
                      View Profile
                    </Link>
                  </>
                ) : (
                  <span className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 text-sm font-medium text-center">
                    Connect to unlock
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 mb-10">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="headline-font text-2xl font-semibold text-slate-900 mb-3">
              A smarter way to lend together
            </h2>
            <p className="text-slate-600 leading-relaxed">
              CreditCoin lending circles blend transparency, credit scoring, and community
              governance so members stay accountable and capital flows fairly.
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: "Community-first",
                  value: "Peer voting with verified history",
                },
                {
                  label: "Credit-aware",
                  value: "Scores update on every payment",
                },
                {
                  label: "Fast access",
                  value: "Coordinate funding in minutes",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-200/80 bg-white/70 p-4"
                >
                  <div className="text-sm font-semibold text-slate-900">{item.label}</div>
                  <div className="text-xs text-slate-500 mt-2">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="headline-font text-lg font-semibold text-slate-900 mb-4">
              Circle momentum
            </h3>
            <div className="space-y-4">
              {[
                { label: "Average monthly contribution", value: "250 CTC" },
                { label: "Active members today", value: "1,284" },
                { label: "On-time payment rate", value: "94%" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white/70 px-4 py-3"
                >
                  <span className="text-sm text-slate-500">{stat.label}</span>
                  <span className="text-sm font-semibold text-slate-900">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="headline-font text-2xl font-semibold text-slate-900 mb-6">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Join a circle",
                description:
                  "Browse lending groups and request access. Coordinators verify membership before approval.",
              },
              {
                step: "02",
                title: "Contribute on time",
                description:
                  "Monthly payments keep the circle liquid and boost your on-chain credit history.",
              },
              {
                step: "03",
                title: "Vote & receive",
                description:
                  "Members vote on payouts using credit-based voting power and transparent rules.",
              },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-slate-200/70 bg-white/70 p-5">
                <div className="text-xs font-semibold tracking-[0.2em] text-slate-400">
                  {item.step}
                </div>
                <h3 className="headline-font text-lg font-semibold text-slate-900 mt-3">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
