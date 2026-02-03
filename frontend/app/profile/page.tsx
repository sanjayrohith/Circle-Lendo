"use client";

import { useAccount } from "wagmi";
import { useCreditProfile } from "@/lib/hooks/useCreditScore";
import { useUserCircles } from "@/lib/hooks/useLendingCircles";
import { CreditScoreCard } from "@/components/CreditScoreCard";
import Link from "next/link";
import { formatAddress } from "@/lib/utils";
import { BASE_CREDIT_SCORE } from "@/lib/contracts/config";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { profile, isLoading } = useCreditProfile();
  const { data: userCircles } = useUserCircles(address);

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="headline-font text-xl font-semibold text-slate-900 mb-2">
            Wallet Not Connected
          </h2>
          <p className="text-slate-600">
            Please connect your wallet to view your credit profile.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-slate-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="headline-font text-4xl font-semibold text-slate-900 mb-8">
        Credit Profile
      </h1>

      <div className="mb-8">
        <CreditScoreCard />
      </div>

      {profile && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="headline-font text-xl font-semibold mb-4 text-slate-900">
              Payment History
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-xl border border-emerald-100 bg-emerald-50/60">
                <div>
                  <p className="font-semibold text-emerald-800">On-Time Payments</p>
                  <p className="text-sm text-emerald-600">
                    Each on-time payment increases your credit score by +10 points
                  </p>
                </div>
                <div className="text-3xl font-bold text-emerald-600">{profile.onTimePayments}</div>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl border border-amber-100 bg-amber-50/70">
                <div>
                  <p className="font-semibold text-amber-800">Late Payments</p>
                  <p className="text-sm text-amber-600">
                    Each late payment decreases your credit score by -20 points
                  </p>
                </div>
                <div className="text-3xl font-bold text-amber-600">{profile.latePayments}</div>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl border border-rose-100 bg-rose-50/70">
                <div>
                  <p className="font-semibold text-rose-800">Defaults</p>
                  <p className="text-sm text-rose-600">
                    Each default decreases your credit score by -100 points
                  </p>
                </div>
                <div className="text-3xl font-bold text-rose-600">{profile.defaults}</div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h2 className="headline-font text-xl font-semibold mb-4 text-slate-900">
              Circle Participation
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-xl border border-blue-100 bg-blue-50/70">
                <div>
                  <p className="font-semibold text-blue-800">Circles Joined</p>
                  <p className="text-sm text-blue-600">Total circles you've participated in</p>
                </div>
                <div className="text-3xl font-bold text-blue-600">{profile.circlesJoined}</div>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                <div>
                  <p className="font-semibold text-slate-800">Circles Completed</p>
                  <p className="text-sm text-slate-600">
                    Each completion increases your credit score by +15 points
                  </p>
                </div>
                <div className="text-3xl font-bold text-slate-700">{profile.circlesCompleted}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card rounded-2xl p-6 mb-8">
        <h2 className="headline-font text-xl font-semibold mb-4 text-slate-900">
          Credit Score Breakdown
        </h2>
        <div className="space-y-4">
          <div className="p-4 border border-slate-200/80 rounded-xl bg-white/70">
            <p className="font-semibold mb-2 text-slate-900">Base Credit Score</p>
            <p className="text-slate-600">{BASE_CREDIT_SCORE} points</p>
            <p className="text-sm text-slate-500 mt-1">
              Every address starts with a base credit score of {BASE_CREDIT_SCORE} points.
            </p>
          </div>
          <div className="p-4 border border-slate-200/80 rounded-xl bg-white/70">
            <p className="font-semibold mb-2 text-slate-900">Credit Score Growth</p>
            <p className="text-slate-600">Unlimited</p>
            <p className="text-sm text-slate-500 mt-1">
              Your credit score can grow indefinitely through good payment behavior and circle completions.
            </p>
          </div>
          <div className="p-4 border border-slate-200/80 rounded-xl bg-white/70">
            <p className="font-semibold mb-2 text-slate-900">How Credit Scores Work</p>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 mt-2">
              <li>On-time payment: +10 points</li>
              <li>Late payment: -20 points</li>
              <li>Default: -100 points</li>
              <li>Circle completion: +15 points</li>
            </ul>
          </div>
        </div>
      </div>

      {userCircles && userCircles.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="headline-font text-xl font-semibold mb-4 text-slate-900">
            Your Circles
          </h2>
          <div className="space-y-2">
            {userCircles.map((circleAddress) => (
              <Link
                key={circleAddress}
                href={`/circles/${circleAddress}`}
                className="block p-4 border border-slate-200/80 rounded-xl bg-white/70 hover:bg-white transition"
              >
                <p className="font-mono text-sm text-slate-900">{formatAddress(circleAddress)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
