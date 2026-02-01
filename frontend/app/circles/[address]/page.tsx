"use client";

import { useParams } from "next/navigation";
import { useCircleDetails } from "@/lib/hooks/useLendingCircles";
import { useAccount, useReadContract } from "wagmi";
import { TransactionButton } from "@/components/TransactionButton";
import { LENDING_CIRCLE_ABI } from "@/lib/contracts/abis/LendingCircle";
import { parseEther, formatEther, getCircleStatus, getStatusColor } from "@/lib/utils";
import { VotingUI } from "@/components/VotingUI";
import { useState } from "react";

export default function CircleDetailPage() {
  const params = useParams();
  const circleAddress = params.address as `0x${string}`;
  const { data: details, isLoading } = useCircleDetails(circleAddress);
  const { address, isConnected } = useAccount();
  const [refreshKey, setRefreshKey] = useState(0);

  if (isLoading || !details) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>Loading circle details...</p>
      </div>
    );
  }

  const isCoordinator = address?.toLowerCase() === details.creator.toLowerCase();
  const isActive = details.status === 1; // ACTIVE
  const isPending = details.status === 0; // PENDING

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Circle Details</h1>
        <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusColor(details.status)}`}>
          {getCircleStatus(details.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Circle Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Monthly Contribution</p>
                <p className="font-semibold text-lg">{details.monthlyContribution} CC</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Duration</p>
                <p className="font-semibold text-lg">{details.durationInMonths} months</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Participants</p>
                <p className="font-semibold text-lg">
                  {details.totalParticipants} / {details.maxParticipants}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Current Month</p>
                <p className="font-semibold text-lg">
                  {details.currentMonth + 1} / {details.durationInMonths}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Pool Balance</p>
                <p className="font-semibold text-lg">{details.poolBalance} CC</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Reserve Percentage</p>
                <p className="font-semibold text-lg">{details.reservePercentage}%</p>
              </div>
            </div>
          </div>

          {isActive && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Current Month Actions</h2>
              <div className="space-y-4">
                {isConnected && (
                  <MakeContributionButton
                    circleAddress={circleAddress}
                    month={details.currentMonth}
                    amount={details.monthlyContribution}
                    onSuccess={() => setRefreshKey((k) => k + 1)}
                  />
                )}
              </div>
            </div>
          )}

          {isActive && (
            <VotingUI
              circleAddress={circleAddress}
              month={details.currentMonth}
              key={refreshKey}
            />
          )}
        </div>

        <div className="space-y-6">
          {isPending && isConnected && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Join Circle</h3>
              <TransactionButton
                contractAddress={circleAddress}
                abi={LENDING_CIRCLE_ABI}
                functionName="requestToJoin"
                onSuccess={() => setRefreshKey((k) => k + 1)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Request to Join
              </TransactionButton>
            </div>
          )}

          {isCoordinator && isPending && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Coordinator Actions</h3>
              <p className="text-sm text-gray-600 mb-4">
                Approve or reject participants who requested to join.
              </p>
              <p className="text-sm text-gray-500">
                (Participant management UI can be added here)
              </p>
            </div>
          )}

          {isConnected && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Withdraw Excess</h3>
              <TransactionButton
                contractAddress={circleAddress}
                abi={LENDING_CIRCLE_ABI}
                functionName="withdrawExcess"
                onSuccess={() => setRefreshKey((k) => k + 1)}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                Withdraw Excess Funds
              </TransactionButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MakeContributionButton({
  circleAddress,
  month,
  amount,
  onSuccess,
}: {
  circleAddress: `0x${string}`;
  month: number;
  amount: string;
  onSuccess: () => void;
}) {
  const { address } = useAccount();
  const { data: hasPaid } = useReadContract({
    address: circleAddress,
    abi: LENDING_CIRCLE_ABI,
    functionName: "hasPaidForMonth",
    args: address ? [address, BigInt(month)] : undefined,
    query: {
      enabled: !!address,
    },
  });

  if (hasPaid) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800">✓ You have already paid for this month</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">Make Monthly Contribution</h3>
      <p className="text-sm text-gray-600 mb-4">Amount: {amount} CC</p>
      <TransactionButton
        contractAddress={circleAddress}
        abi={LENDING_CIRCLE_ABI}
        functionName="makeContribution"
        args={[BigInt(month)]}
        value={amount && !isNaN(parseFloat(amount)) ? parseEther(amount) : 0n}
        onSuccess={onSuccess}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Pay {amount} CC
      </TransactionButton>
    </div>
  );
}
