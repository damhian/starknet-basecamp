"use client";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-stark/useScaffoldEventHistory";

type CounterChangedParsedArgs = {
  caller: string;
  old_value: number;
  new_value: number;
  reason: Reason;
}

type Reason = {
  variant: Record<string, {}>;
}

export const CounterEvents = () => { 
  const { data: counterChangedEvents,isLoading, error } = useScaffoldEventHistory({
    contractName: "CounterContract",
    eventName: "CounterChanged",
    fromBlock: 0n,
    watch: true,
    format: true,
  })

  if(error) return <div className="text-error">Error loading</div>

  const activeVariant = (reason: Reason): String => {
    const variant = reason.variant;
    const keys = Object.keys(variant);
    if (keys.length === 0) { return "" }
    else if (keys.length == 1) {
      return keys[0]
    } else {
      return keys.find((k) => variant[k]) ?? "";
    }
  } 
  
  return (
    <div className="w-full max-w-xl mt-6">
      <h3 className="text-xl font-semibold text-white mb-4">Counter Changed Events</h3>
      <div className="border rounded p-3 space-y-2 text-sm">
        {counterChangedEvents && counterChangedEvents.length > 0 ? (
          counterChangedEvents.map((ev: { parsedArgs: CounterChangedParsedArgs }, idx: number) => (
            <div key={idx}>
              <div>
                <span className="font-medium">Caller:</span> {ev.parsedArgs.caller}
              </div>
              <div>
                <span className="font-medium">Old:</span> {ev.parsedArgs.old_value}
                {""}
              </div>
              <div>
                <span className="font-medium">New:</span> {ev.parsedArgs.new_value}
                {""}
              </div>
              <div>
                <span className="font-medium">Reason:</span> {activeVariant(ev.parsedArgs.reason)}
                {""}
              </div>
            </div>
          ))
        ) : (
            <div className="text-gray-600">No events found</div>
        )}
      </div>
    </div>
  )
}