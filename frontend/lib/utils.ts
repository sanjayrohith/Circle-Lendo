import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatEther(value: bigint | string | number): string {
  if (typeof value === "string") {
    const num = parseFloat(value);
    if (isNaN(num) || !isFinite(num)) {
      return "0.0000";
    }
    return num.toFixed(4);
  }
  if (typeof value === "number") {
    if (isNaN(value) || !isFinite(value)) {
      return "0.0000";
    }
    return value.toFixed(4);
  }
  // For bigint, convert to string first
  if (value === null || value === undefined) {
    return "0.0000";
  }
  const str = value.toString();
  const num = parseFloat(str) / 1e18;
  if (isNaN(num) || !isFinite(num)) {
    return "0.0000";
  }
  return num.toFixed(4);
}

export function parseEther(value: string): bigint {
  const num = parseFloat(value);
  if (isNaN(num) || !isFinite(num)) {
    throw new Error(`Invalid number: ${value}`);
  }
  if (num < 0) {
    throw new Error(`Negative value not allowed: ${value}`);
  }
  return BigInt(Math.floor(num * 1e18));
}

export function getCircleStatus(status: number): string {
  const statuses = ["PENDING", "ACTIVE", "COMPLETED", "CANCELLED"];
  return statuses[status] || "UNKNOWN";
}

export function getStatusColor(status: number): string {
  const colors = {
    0: "bg-yellow-100 text-yellow-800", // PENDING
    1: "bg-green-100 text-green-800", // ACTIVE
    2: "bg-blue-100 text-blue-800", // COMPLETED
    3: "bg-red-100 text-red-800", // CANCELLED
  };
  return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
}
