import type { Asset } from "@/lib/portfolio";

/** CSS frames keep the supplied interface pixels and text intact. */
export default function WebsiteMockup({ asset, secondary, laptop = false, eager = false, phone = false, zh = true }: {
  asset: Asset; secondary?: Asset; laptop?: boolean; eager?: boolean; phone?: boolean; zh?: boolean;
}) {
  const screen = (page: Asset, floating = false) => <div className={`web-device${floating ? " web-device-floating" : ""}`}>
    {laptop && !floating && <div className="web-camera" aria-hidden="true"><i /></div>}
    {!phone && <div className="web-browser-bar" aria-hidden="true"><span className="web-browser-dots"><i/><i/><i/></span><span>POKER MARS</span><span>↗</span></div>}
    <div className="web-screen"><img src={page.src} width={page.width} height={page.height} alt={zh ? page.labelZh : page.label} loading={eager ? "eager" : "lazy"} decoding="async" /></div>
  </div>;
  return <div className={`website-mockup${phone ? " mockup-phone" : laptop ? " mockup-laptop" : " mockup-browser"}${secondary ? " mockup-composition" : ""}`}>
    <span className="mockup-overline" aria-hidden="true">POKER MARS <span>{phone ? "GAME INTERFACE" : "WEB EXPERIENCE"}</span></span>
    <div className="web-device-group">
      {screen(asset)}
      {laptop && <div className="web-laptop-base" aria-hidden="true"><i /></div>}
    </div>
    {secondary && screen(secondary, true)}
    <span className="mockup-baseline" aria-hidden="true">INTERFACE / VISUAL DESIGN</span>
  </div>;
}
