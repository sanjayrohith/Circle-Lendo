"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useCreditScore } from "@/lib/hooks/useCreditScore";
import { TransactionButton } from "@/components/TransactionButton";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/config";
import { LENDING_CIRCLE_FACTORY_ABI } from "@/lib/contracts/abis/LendingCircleFactory";
import { parseEther, formatEther } from "@/lib/utils";

// Credit-based limits constants (from LendingCircle.sol)
const MAX_CONTRIBUTION_PER_CREDIT = 1e18; // 1 ETH per credit point
const MAX_PARTICIPANTS_PER_CREDIT = 1; // 1 participant per credit point
const MAX_EXPOSURE_PER_CREDIT = 10e18; // 10 ETH per credit point
import { useRouter } from "next/navigation";

export default function CreateCirclePage() {
  const { address, isConnected } = useAccount();
  const { creditScore } = useCreditScore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    monthlyContribution: "",
    durationInMonths: "6",
    minParticipants: "3",
    maxParticipants: "6",
    reservePercentage: "10",
    excessDistributionMethod: "0", // 0 = WITHDRAWABLE, 1 = AUTO_DEDUCT
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-900 mb-2">
            Wallet Not Connected
          </h2>
          <p className="text-yellow-700">
            Please connect your wallet to create a lending circle.
          </p>
        </div>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const monthly = parseFloat(formData.monthlyContribution);
    const minPart = parseInt(formData.minParticipants);
    const maxPart = parseInt(formData.maxParticipants);
    const duration = parseInt(formData.durationInMonths);
    const reserve = parseInt(formData.reservePercentage);

    // Credit-based limits
    const maxContribution = creditScore * MAX_CONTRIBUTION_PER_CREDIT;
    const maxParticipants = creditScore * MAX_PARTICIPANTS_PER_CREDIT;
    const maxExposure = creditScore * MAX_EXPOSURE_PER_CREDIT;

    if (!formData.monthlyContribution || monthly <= 0) {
      newErrors.monthlyContribution = "Monthly contribution must be greater than 0";
    } else if (monthly > maxContribution) {
      newErrors.monthlyContribution = `Exceeds credit limit (max: ${formatEther(maxContribution)} CC)`;
    }

    if (minPart < 2) {
      newErrors.minParticipants = "Minimum 2 participants required";
    }

    if (maxPart < minPart) {
      newErrors.maxParticipants = "Max participants must be >= min participants";
    } else if (maxPart > maxParticipants) {
      newErrors.maxParticipants = `Exceeds credit limit (max: ${maxParticipants})`;
    }

    if (duration <= 0) {
      newErrors.durationInMonths = "Duration must be greater than 0";
    }

    if (reserve < 0 || reserve > 100) {
      newErrors.reservePercentage = "Reserve percentage must be between 0 and 100";
    }

    const totalExposure = monthly * maxPart * duration;
    if (totalExposure > maxExposure) {
      newErrors.totalExposure = `Total exposure exceeds credit limit (max: ${formatEther(maxExposure)} CC)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    // Transaction will be handled by TransactionButton
  };

  const args = [
    formData.monthlyContribution ? parseEther(formData.monthlyContribution) : 0n,
    BigInt(formData.durationInMonths || 0),
    BigInt(formData.minParticipants || 0),
    BigInt(formData.maxParticipants || 0),
    BigInt(formData.reservePercentage || 0),
    BigInt(formData.excessDistributionMethod || 0),
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Create Lending Circle</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Your Credit Score:</strong> {creditScore} / 1000
        </p>
        <p className="text-sm text-blue-800 mt-1">
          Credit-based limits: Max contribution {formatEther(creditScore * MAX_CONTRIBUTION_PER_CREDIT)} CC, 
          Max participants {creditScore * MAX_PARTICIPANTS_PER_CREDIT}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Contribution (CC)
          </label>
          <input
            type="number"
            step="0.0001"
            value={formData.monthlyContribution}
            onChange={(e) => setFormData({ ...formData, monthlyContribution: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="1.0"
          />
          {errors.monthlyContribution && (
            <p className="text-red-500 text-sm mt-1">{errors.monthlyContribution}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (Months)
          </label>
          <input
            type="number"
            value={formData.durationInMonths}
            onChange={(e) => setFormData({ ...formData, durationInMonths: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
          />
          {errors.durationInMonths && (
            <p className="text-red-500 text-sm mt-1">{errors.durationInMonths}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Participants
            </label>
            <input
              type="number"
              value={formData.minParticipants}
              onChange={(e) => setFormData({ ...formData, minParticipants: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="2"
            />
            {errors.minParticipants && (
              <p className="text-red-500 text-sm mt-1">{errors.minParticipants}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Participants
            </label>
            <input
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="2"
            />
            {errors.maxParticipants && (
              <p className="text-red-500 text-sm mt-1">{errors.maxParticipants}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reserve Percentage (0-100)
          </label>
          <input
            type="number"
            value={formData.reservePercentage}
            onChange={(e) => setFormData({ ...formData, reservePercentage: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            max="100"
          />
          {errors.reservePercentage && (
            <p className="text-red-500 text-sm mt-1">{errors.reservePercentage}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excess Distribution Method
          </label>
          <select
            value={formData.excessDistributionMethod}
            onChange={(e) => setFormData({ ...formData, excessDistributionMethod: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="0">Withdrawable</option>
            <option value="1">Auto-Deduct</option>
          </select>
        </div>

        {errors.totalExposure && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{errors.totalExposure}</p>
          </div>
        )}

        <TransactionButton
          contractAddress={CONTRACT_ADDRESSES.factory}
          abi={LENDING_CIRCLE_FACTORY_ABI}
          functionName="createCircle"
          args={args}
          onSuccess={() => {
            router.push("/circles");
          }}
          className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 font-semibold"
        >
          Create Circle
        </TransactionButton>
      </div>
    </div>
  );
}
