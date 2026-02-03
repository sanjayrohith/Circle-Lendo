"use client";

import { useCreditScore, useCreditProfile } from "@/lib/hooks/useCreditScore";
import { useAccount } from "wagmi";
import { BASE_CREDIT_SCORE } from "@/lib/contracts/config";

export function CreditScoreCard() {
  const { address } = useAccount();
  const { creditScore, isLoading } = useCreditScore();
  const { profile } = useCreditProfile();

  if (!address) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6">
        <p className="text-sm text-slate-500">Connect wallet to view credit score.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6">
        <p className="text-sm text-slate-600">Loading credit score...</p>
      </div>
    );
  }

  // Dynamic color based on score ranges (no maximum limit)
  const scoreColor =
    creditScore >= 700
      ? "text-green-600"
      : creditScore >= 500
      ? "text-yellow-600"
      : creditScore >= 300
      ? "text-orange-600"
      : "text-red-600";

  // Calculate progress bar width based on a visual scale (not a hard limit)
  // Use a dynamic scale that adjusts based on the score
  const visualScale = Math.max(creditScore * 1.2, 1000); // Scale adjusts to show progress
  const progressWidth = Math.min((creditScore / visualScale) * 100, 100);

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="headline-font text-xl font-semibold text-slate-900">Credit Score</h2>
          <p className="text-sm text-slate-500">
            Baseline {BASE_CREDIT_SCORE} · Updates with each payment
          </p>
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Live
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-5 mb-6">
        <div className={`text-5xl font-semibold ${scoreColor}`}>{creditScore}</div>
        <div className="flex-1 min-w-[180px]">
          <div className="w-full rounded-full bg-slate-100 h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full ${
                creditScore >= 700
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                  : creditScore >= 500
                  ? "bg-gradient-to-r from-amber-400 to-amber-300"
                  : creditScore >= 300
                  ? "bg-gradient-to-r from-orange-500 to-orange-400"
                  : "bg-gradient-to-r from-rose-500 to-rose-400"
              }`}
              style={{ width: `${progressWidth}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">Score strength: {creditScore} points</p>
        </div>
      </div>

      {profile && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Circles joined</p>
            <p className="font-semibold text-slate-900 mt-2">{profile.circlesJoined}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Circles completed</p>
            <p className="font-semibold text-slate-900 mt-2">{profile.circlesCompleted}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">On-time payments</p>
            <p className="font-semibold text-emerald-600 mt-2">{profile.onTimePayments}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Late payments</p>
            <p className="font-semibold text-amber-500 mt-2">{profile.latePayments}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Defaults</p>
            <p className="font-semibold text-rose-500 mt-2">{profile.defaults}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Status</p>
            <p className="font-semibold mt-2">
              {profile.hasDefaulted ? (
                <span className="text-rose-500">Defaulted</span>
              ) : (
                <span className="text-emerald-600">Active</span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
