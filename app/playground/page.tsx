import { presets } from "@/src/core/samples";
import Playground from "@/components/Playground";

export default function Page() {
  // samples are generated on the server and handed to the client editor
  const samples = Object.fromEntries(Object.entries(presets).map(([k, f]) => [k, f()]));
  return <Playground samples={samples} />;
}
