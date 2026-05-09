import SEMConverter from "../../components/SEMConverter";
import PixelBlast from "@/components/PixelBlast";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        <PixelBlast
          variant="circle"
          pixelSize={4}
          color="#E26132"
          patternScale={3}
          patternDensity={1.2}
          enableRipples={true}
          rippleSpeed={0.3}
          rippleThickness={0.11}
          rippleIntensityScale={1}
          speed={0.5}
          transparent
          edgeFade={0.2}
        />
      </div>
      <div className="relative z-10 flex items-center justify-center p-4 min-h-screen animate-blur-in">
        <SEMConverter />
      </div>
    </div>
  );
}