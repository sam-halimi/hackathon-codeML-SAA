import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { NovaSpot } from "./nova/NovaSpot";
import { DUREE_IMAGES, FPS } from "./nova/temps";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      {/* Spot NOVA (Projet 360) : 60 images par seconde, minutage calé sur la voix (src/nova/minutage.json). */}
      <Composition id="NovaSpot16x9" component={NovaSpot} durationInFrames={DUREE_IMAGES} fps={FPS} width={1920} height={1080} />
      <Composition id="NovaSpot9x16" component={NovaSpot} durationInFrames={DUREE_IMAGES} fps={FPS} width={1080} height={1920} />
    </>
  );
};
