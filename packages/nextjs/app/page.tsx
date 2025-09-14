"use client";
import { ConnectedAddress } from "~~/components/ConnectedAddress";
import { CounterProvider } from "~~/components/context/CounterContext";
import { Counter } from "~~/components/Counter";
import { IncreaseCounter } from "~~/components/IncreaseCounter";
import { DecreaseCounter } from "~~/components/DecreaseCounter";
import { SetCounter } from "~~/components/SetCounter";
import { ResetCounter } from "~~/components/ResetCounter";
import { CounterEvents } from "~~/components/CounterEvents";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { useAccount } from "~~/hooks/useAccount";

const Home = () => {

  const { data: ownerAddress } = useScaffoldReadContract({
    contractName: "CounterContract",
    functionName: "owner",
  })

  const ownerAddressStr = (ownerAddress) ? ownerAddress.toString() : "";

  const { address: currentUserAddress } = useAccount();
  const currentUserAddressStr = currentUserAddress ?? "";

  return (
    <div className="flex items-center flex-col grow pt-10">
      <CounterProvider>
        <Counter />
        <div className="mt-6 flex gap-4">
          <IncreaseCounter />
          <DecreaseCounter ownerAddress={ownerAddressStr} currentUserAddress={currentUserAddressStr} />
          <SetCounter ownerAddress={ownerAddressStr} currentUserAddress={currentUserAddressStr} />
        </div>
        <div className="mt-6 flex gap-4">
          <ResetCounter ownerAddress={ownerAddressStr} currentUserAddress={currentUserAddressStr} />
        </div>
        {/* <div className="mt-6">
          
        </div> */}
      </CounterProvider>
      <CounterEvents />
    </div>
  );
};

export default Home;
