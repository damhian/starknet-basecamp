"use client";
import { useCounterContext } from "./context/CounterContext";

export const Counter = () => {
  const { counterValue, isLoading, error } = useCounterContext();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading counter value...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-600 font-medium">Error loading counter</p>
        <p className="text-red-500 text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md border">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Counter Contract</h2>
      <div className="text-center">
        <p className="text-lg text-gray-600 mb-2">Current Counter Value:</p>
        <div className="text-4xl font-bold text-blue-600 bg-blue-50 px-6 py-3 rounded-lg">
          {String(counterValue)}
        </div>
      </div>
    </div>
  );
};
