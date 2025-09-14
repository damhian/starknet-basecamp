"use client";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { useState } from "react";

export const IncreaseCounter = () => {
  const [isPending, setIsPending] = useState(false);
  
  const { sendAsync: increaseCounter, isPending: isTransactionLoading, error } = useScaffoldWriteContract({
    contractName: "CounterContract",
    functionName: "increase_counter",
    args: [],
  });

  const handleIncreaseCounter = async () => {
    try {
      setIsPending(true);
      await increaseCounter();
    } catch (err) {
      console.error("Error increasing counter:", err);
    } finally {
      setIsPending(false);
    }
  };

  const isTransactionPending = isTransactionLoading || isPending;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md border">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Increase Counter</h3>
      
      <button
        onClick={handleIncreaseCounter}
        disabled={isTransactionPending}
        className={`
          px-6 py-3 rounded-lg font-medium transition-all duration-200
          ${isTransactionPending
            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 text-white hover:shadow-lg transform hover:scale-105"
          }
        `}
      >
        {isTransactionPending ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Increasing...</span>
          </div>
        ) : (
          "Increase Counter"
        )}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm font-medium">Transaction Error</p>
          <p className="text-red-500 text-xs mt-1">{error.message}</p>
        </div>
      )}

      <p className="text-sm text-gray-500 mt-3 text-center">
        Click the button to increase the counter by 1
      </p>
    </div>
  );
};
