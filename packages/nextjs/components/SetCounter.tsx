"use client";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
// import { useAccount } from "~~/hooks/useAccount";
import { useState } from "react";

interface SetCounterProps {
  ownerAddress: string;
  currentUserAddress: string;
}

export const SetCounter = ({ ownerAddress, currentUserAddress }: SetCounterProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isPending, setIsPending] = useState(false);

  const { sendAsync: setCounter, isPending: isTransactionLoading, error } = useScaffoldWriteContract({
    contractName: "CounterContract",
    functionName: "set_counter",
    args: [parseInt(inputValue) || 0],
  });

  const handleSetCounter = async () => {
    const value = parseInt(inputValue);
    if (isNaN(value) || value < 0) {
      return;
    }

    try {
      setIsPending(true);
      await setCounter();
      setInputValue(""); // Clear input after successful transaction
    } catch (err) {
      console.error("Error setting counter:", err);
    } finally {
      setIsPending(false);
    }
  };

  const isTransactionPending = isTransactionLoading || isPending;
  const isValidInput = inputValue !== "" && !isNaN(parseInt(inputValue)) && parseInt(inputValue) >= 0;
  const currentOwnerAddress = ownerAddress?.toString();
  const currentUserAddressValue = BigInt(currentUserAddress ?? 0).toString();
  const isOwner = currentOwnerAddress === currentUserAddressValue;
  const isDisabled = !isValidInput || isTransactionPending || !isOwner;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md border">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Set Counter</h3>
      
      {/* Owner Status Display */}
      {isOwner ? (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 text-sm font-medium">✓ You are the contract owner</p>
          <p className="text-green-500 text-xs mt-1">You can set the counter value</p>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm font-medium">✗ You are not the contract owner</p>
          <p className="text-red-500 text-xs mt-1">Only the owner can set the counter value</p>
        </div>
      )}
      
      <div className="w-full max-w-xs">
        <div className="mb-4">
          <label htmlFor="counter-input" className="block text-sm font-medium text-gray-700 mb-2">
            Enter new counter value:
          </label>
          <input
            id="counter-input"
            type="number"
            min="0"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter a number..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isTransactionPending}
          />
        </div>

        <button
          onClick={handleSetCounter}
          disabled={isDisabled}
          className={`
            w-full px-6 py-3 rounded-lg font-medium transition-all duration-200
            ${isDisabled
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg transform hover:scale-105"
            }
          `}
        >
          {isTransactionPending ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Setting...</span>
            </div>
          ) : (
            "Set Counter"
          )}
        </button>
      </div>

      {!isValidInput && inputValue !== "" && !isTransactionPending && isOwner && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-600 text-sm font-medium">Invalid Input</p>
          <p className="text-yellow-500 text-xs mt-1">Please enter a valid non-negative number</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm font-medium">Transaction Error</p>
          <p className="text-red-500 text-xs mt-1">{error.message}</p>
        </div>
      )}

      <p className="text-sm text-gray-500 mt-3 text-center">
        Enter a number and click to set the counter value
      </p>
    </div>
  );
};
