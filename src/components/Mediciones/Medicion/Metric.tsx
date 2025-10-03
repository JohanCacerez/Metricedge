import { useRef } from "react";
import CaptureImage, { CaptureImageRef } from "./CaptureImage";
import CaptureButtons from "./Capturebuttons";

export default function Metric() {
  const captureRef = useRef<CaptureImageRef>(null);

  return (
    <div className="flex h-full flex-row gap-4">
      <div className="flex-[3] h-full">
        <CaptureImage ref={captureRef} />
      </div>
      <div className="flex-[1] h-full justify-center items-center">
        <CaptureButtons captureRef={captureRef} />
      </div>
    </div>
  );
}
