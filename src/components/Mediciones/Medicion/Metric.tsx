import Capturebuttons from "./Capturebuttons";
import CaptureImage from "./CaptureImage";

export default function Metric() {
  return (
    <div className="flex h-full flex-row gap-4">
      <div className="flex-[3] h-full">
        <CaptureImage />
      </div>
      <div className="flex-[1] h-full justify-center items-center">
        <Capturebuttons />
      </div>
    </div>
  );
}
