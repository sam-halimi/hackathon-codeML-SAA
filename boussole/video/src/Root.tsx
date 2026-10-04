import { Composition } from "remotion";
import { BoussoleDemo, BoussoleShort } from "./Boussole";
import { AD_FRAMES, BoussoleAd16x9 } from "./ad/BoussoleAd";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="BoussoleDemo" component={BoussoleDemo} durationInFrames={1200} fps={30} width={1920} height={1080} />
      <Composition id="BoussoleAd16x9" component={BoussoleAd16x9} durationInFrames={AD_FRAMES} fps={60} width={1920} height={1080} />
      <Composition id="BoussoleShort" component={BoussoleShort} durationInFrames={450} fps={30} width={1920} height={1080} />
    </>
  );
};
