import { Loader2 } from "lucide-react";

const Spinner = () => (
  <div className="flex items-center justify-center p-6 text-primary">
    <Loader2 className="h-5 w-5 animate-spin" />
  </div>
);

export default Spinner;
