import { StateFilter } from "../StateFilter";
import { useState } from "react";

export default function StateFilterExample() {
  const [selectedState, setSelectedState] = useState("");

  return (
    <div className="h-screen w-80 border-r">
      <StateFilter
        selectedState={selectedState}
        onStateChange={(state) => {
          console.log("State changed:", state);
          setSelectedState(state);
        }}
      />
    </div>
  );
}
