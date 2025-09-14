"use client";
import { useCounterContext } from "./context/CounterContext";
import { useScaffoldMultiWriteContract, createContractCall } from "~~/hooks/scaffold-stark/useScaffoldMultiWriteContract";
import { useDeployedContractInfo } from "~~/hooks/scaffold-stark/useDeployedContractInfo";
import useScaffoldStrkBalance from "~~/hooks/scaffold-stark/useScaffoldStrkBalance";
import { useState } from "react";
import { uint256 } from "starknet";

interface DecreaseCounterProps {
  ownerAddress: string;
  currentUserAddress: string;
}

const DECIMALS = 18n;
const PAYMENT_TOKENS = 1n;
const PAYMENT_AMOUNT = uint256.bnToUint256(PAYMENT_TOKENS * 10n ** DECIMALS);

export const DecreaseCounter = ({ ownerAddress, currentUserAddress }: DecreaseCounterProps) => {
  const { counterValue } = useCounterContext();
  const [isPending, setIsPending] = useState(false);
  const { data: counterContract } = useDeployedContractInfo("CounterContract");
  const counterAddress = counterContract?.address;

  const { value: strkBalance, isLoading: isBalanceLoading } = useScaffoldStrkBalance({
    address: currentUserAddress,
  });

  const currentOwnerAddress = ownerAddress?.toString();
  const currentUserAddressValue = BigInt(currentUserAddress ?? 0).toString();
  const isOwner = currentOwnerAddress === currentUserAddressValue;

  // Create calls based on owner status and counter value
  let calls: any[] = [];

  if (isOwner) {
    // Owner can just decrease
    calls = [{
      contractName: "CounterContract",
      functionName: "decrease_counter",
      args: [],
    }];
  } else if (counterValue === 1) {
    // Non-owner: decrease + reset (with STRK payment) only when counter is at 1
    calls = [
      {
        contractName: "CounterContract",
        functionName: "decrease_counter",
        args: [],
      },
      createContractCall("Strk", "approve", [counterAddress, PAYMENT_AMOUNT]),
      {
        contractName: "CounterContract",
        functionName: "reset_counter",
        args: [],
      }
    ];
  } else {
    // Non-owner: just decrease for other values
    calls = [{
      contractName: "CounterContract",
      functionName: "decrease_counter",
      args: [],
    }];
  }

  const { sendAsync: executeDecrease, isPending: isTransactionLoading, error } = useScaffoldMultiWriteContract({ calls });
  
  const handleDecreaseCounter = async () => {
    try {
      setIsPending(true);
      await executeDecrease();
    } catch (err) {
      console.error("Error decreasing counter:", err);
    } finally {
      setIsPending(false);
    }
  };

  const isTransactionPending = isTransactionLoading || isPending;
  const isCounterZero = counterValue === 0;
  const hasEnoughBalance = (strkBalance ?? 0n) >= PAYMENT_TOKENS * 10n ** DECIMALS;
  
  // For non-owners, check if they have enough balance for the reset payment (only when counter is at 1)
  const needsPayment = !isOwner && counterValue === 1;
  const canDecrease = isOwner || !needsPayment || hasEnoughBalance;
  const isDisabled = isCounterZero || isTransactionPending || !canDecrease || isBalanceLoading;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md border">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Decrease Counter</h3>
      
      {/* Owner Status Display */}
      {isOwner ? (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 text-sm font-medium">✓ You are the contract owner</p>
          <p className="text-green-500 text-xs mt-1">You can decrease the counter for free</p>
        </div>
      ) : counterValue === 1 ? (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-orange-600 text-sm font-medium">⚠️ Special Case: Counter at 1</p>
          <p className="text-orange-500 text-xs mt-1">Decreasing will reset counter to 0 (costs 1 STRK)</p>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-600 text-sm font-medium">ℹ️ Non-owner decrease</p>
          <p className="text-blue-500 text-xs mt-1">Normal decrease operation (no payment required)</p>
        </div>
      )}

      {/* Payment Info for Non-owners when counter is at 1 */}
      {needsPayment && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-600 text-sm font-medium">⚠️ Payment Required</p>
          <p className="text-yellow-500 text-xs mt-1">
            Decreasing from 1 to 0 will automatically reset the counter and cost 1 STRK
          </p>
        </div>
      )}

      {/* Balance Status for Non-owners when counter is at 1 */}
      {needsPayment && (
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
              <span className="text-gray-600">Required for reset operation</span>
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={handleDecreaseCounter}
        disabled={isDisabled}
        className={`
          px-6 py-3 rounded-lg font-medium transition-all duration-200
          ${isDisabled
            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700 text-white hover:shadow-lg transform hover:scale-105"
          }
        `}
      >
        {isTransactionPending ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Decreasing...</span>
          </div>
        ) : (
          isOwner ? "Decrease Counter (Free)" : 
          counterValue === 1 ? "Decrease Counter (Reset + 1 STRK)" : "Decrease Counter"
        )}
      </button>

      {isCounterZero && !isTransactionPending && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-600 text-sm font-medium">Cannot Decrease</p>
          <p className="text-yellow-500 text-xs mt-1">Counter is already at 0</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm font-medium">Transaction Error</p>
          <p className="text-red-500 text-xs mt-1">{error.message}</p>
        </div>
      )}

      <p className="text-sm text-gray-500 mt-3 text-center">
        {isOwner 
          ? "Click the button to decrease the counter by 1 (free for owner)" 
          : counterValue === 1 
            ? "Click the button to decrease from 1 to 0 (will reset and cost 1 STRK)"
            : "Click the button to decrease the counter by 1"
        }
      </p>
    </div>
  );
};
