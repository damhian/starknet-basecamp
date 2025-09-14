"use client";
import { useScaffoldMultiWriteContract, createContractCall } from "~~/hooks/scaffold-stark/useScaffoldMultiWriteContract";
import { useDeployedContractInfo } from "~~/hooks/scaffold-stark/useDeployedContractInfo";
import useScaffoldStrkBalance from "~~/hooks/scaffold-stark/useScaffoldStrkBalance";
import { useCounterContext } from "./context/CounterContext";
import { useState } from "react";
import { uint256 } from "starknet";

interface ResetCounterProps {
  ownerAddress: string;
  currentUserAddress: string;
}

const DECIMALS = 18n;
const PAYMENT_TOKENS = 1n;
const PAYMENT_AMOUNT = uint256.bnToUint256(PAYMENT_TOKENS * 10n ** DECIMALS);

export const ResetCounter = ({ ownerAddress, currentUserAddress }: ResetCounterProps) => {
  const { data: counterContract } = useDeployedContractInfo("CounterContract");
  const counterAddress = counterContract?.address;

  const [isPending, setIsPending] = useState(false);

  const { value: strkBalance, isLoading: isBalanceLoading } = useScaffoldStrkBalance({
    address: currentUserAddress,
  });

  const resetCall = {
    contractName: "CounterContract",
    functionName: "reset_counter",
    args: [],
  }

  const currentOwnerAddress = ownerAddress?.toString();
  const currentUserAddressValue = BigInt(currentUserAddress ?? 0).toString();
  const isOwner = currentOwnerAddress === currentUserAddressValue;

  let calls: any[] = [];

  if (isOwner) {
    // Owner can reset for free
    calls = [resetCall];
  } else if (counterAddress) {
    // Non-owner needs to approve and pay 1 STRK
    calls = [
      createContractCall("Strk", "approve", [counterAddress, PAYMENT_AMOUNT]),
      resetCall,
    ]
  }

  const { sendAsync: resetCounter, isPending: isTransactionLoading, error } = useScaffoldMultiWriteContract({ calls });

  const handleResetCounter = async () => {
    try {
      setIsPending(true);
      await resetCounter();
    } catch (err) {
      console.error("Error resetting counter:", err);
    } finally {
      setIsPending(false);
    }
  };

  const isTransactionPending = isTransactionLoading || isPending;
  const { counterValue } = useCounterContext();
  const isZero = counterValue === 0;
  const hasEnoughBalance = (strkBalance ?? 0n) >= PAYMENT_TOKENS * 10n ** DECIMALS; 
  
  // For non-owners, check if they have enough balance
  const canReset = isOwner || hasEnoughBalance;
  const isDisabled = isTransactionPending || isBalanceLoading || !canReset || isZero;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md border">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Reset Counter</h3>
      
      {/* Owner Status Display */}
      {isOwner ? (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 text-sm font-medium">✓ You are the contract owner</p>
          <p className="text-green-500 text-xs mt-1">You can reset the counter for free</p>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-600 text-sm font-medium">ℹ️ Non-owner reset</p>
          <p className="text-blue-500 text-xs mt-1">This will cost 1 STRK to reset the counter</p>
        </div>
      )}

      {/* STRK Balance and Payment Info */}
      {!isOwner && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-600 text-sm font-medium">⚠️ Payment Required</p>
          <p className="text-yellow-500 text-xs mt-1">
            This action requires 1 STRK payment to the contract owner
          </p>
          <div className="mt-2 text-xs text-yellow-600">
            <p>• You need at least 1 STRK in your wallet</p>
            <p>• You must approve the contract to spend 1 STRK</p>
            <p>• Payment will be transferred to the contract owner</p>
          </div>
        </div>
      )}

      {/* Balance Status for Non-owners */}
      {!isOwner && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-600 text-sm font-medium mb-2">Requirements Status:</p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <span className={hasEnoughBalance ? "text-green-600" : "text-red-600"}>
                {hasEnoughBalance ? "✓" : "✗"}
              </span>
              <span className="text-gray-600">STRK Balance: {hasEnoughBalance ? "Sufficient (1+ STRK)" : "Insufficient (< 1 STRK)"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">ℹ️</span>
              <span className="text-gray-600">Contract will auto-approve STRK spending</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleResetCounter}
        disabled={isDisabled}
        className={`
          px-6 py-3 rounded-lg font-medium transition-all duration-200
          ${isDisabled
            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
            : "bg-orange-600 hover:bg-orange-700 text-white hover:shadow-lg transform hover:scale-105"
          }
        `}
      >
        {isTransactionPending ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Resetting...</span>
          </div>
        ) : (
          isOwner ? "Reset Counter (Free)" : "Reset Counter (1 STRK)"
        )}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm font-medium">Transaction Error</p>
          <p className="text-red-500 text-xs mt-1">{error.message}</p>
        </div>
      )}

      <p className="text-sm text-gray-500 mt-3 text-center">
        {isOwner 
          ? "Reset the counter to 0 (free for owner)" 
          : "Reset the counter to 0 (requires 1 STRK payment)"
        }
      </p>
    </div>
  );
};
