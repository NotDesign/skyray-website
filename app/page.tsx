"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowDown, ArrowLeft, ArrowRight, X, Menu, Plus, Minus, Download, Check, MoveHorizontal, Sun, Moon, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import DigitalFog from "@/components/digital-fog";
import SiteEffects from "@/components/site-effects";
import PageLoop from "@/components/page-loop";
import { categories, projects, type Asset } from "@/lib/portfolio";
import { filterProjects, portfolioPath, portfolioUrl, readPortfolioState } from "@/lib/portfolio-navigation";
import PortfolioPage from "./portfolio-page";
import PortfolioCard from "@/components/portfolio-card";

const expertise = [
  { en: "Game production", zh: "遊戲製作", description: "Game mechanics, programming and art production come together to turn creative ideas into playable experiences.", descriptionZh: "結合遊戲機制、程式開發與美術製作，將創意做成可操作、可遊玩的遊戲體驗。", tags: "GAME DESIGN / DEVELOPMENT / ART PRODUCTION", projectType: "Game Production" },
  { en: "System development", zh: "系統開發", description: "Custom applications, web systems and cloud backends shaped around product and operational needs, connecting interfaces, data and workflows.", descriptionZh: "依產品與營運需求，開發客製化應用、網站系統與雲端後台，串連介面、資料與操作流程。", tags: "CUSTOM APPS / WEB SYSTEMS / CLOUD BACKENDS", projectType: "System Development" },
  { en: "Worlds & characters", zh: "角色與世界", description: "Character, vehicle and environment art. Form, material and lighting, considered together.", descriptionZh: "從角色、載具到環境場景，整合形體、材質與光影，建立完整的視覺世界。", tags: "3D MODELING / GAME ART / LOOK DEVELOPMENT", filter: "3d" },
  { en: "Digital experiences", zh: "網站與數位體驗", description: "Websites and interfaces that carry the visual world into every screen.", descriptionZh: "讓品牌與作品的視覺語言，延伸到網站、介面與不同尺寸的螢幕。", tags: "WEB DESIGN / UI DESIGN / ART DIRECTION", filter: "web" },
  { en: "Visual identities", zh: "品牌與視覺語言", description: "Identity, illustration and packaging. An idea made recognizable across different media.", descriptionZh: "透過識別、插畫與包裝，讓同一個想法在不同媒介裡，有一致而鮮明的樣子。", tags: "IDENTITY / ILLUSTRATION / PACKAGING", filter: "brand" },
];
function Artwork({ asset, alt, eager = false }: { asset: Asset; alt: string; eager?: boolean }) {
  return <img src={asset.src} alt={alt} width={asset.width} height={asset.height} loading={eager ? "eager" : "lazy"} decoding="async" />;
}
function Hero({ zh, motionOn, heroView, setHeroView, openProject, continuation = false }: {
  zh: boolean; motionOn: boolean; heroView: number; setHeroView: (view: number) => void;
  openProject: (index: number, asset?: number) => void; continuation?: boolean;
}) {
  const t = (en: string, cn: string) => zh ? cn : en;
  return <section className={`hero ${continuation ? "hero-continuation" : ""}`} id={continuation ? undefined : "hero"} aria-labelledby={continuation ? "loop-hero-title" : "hero-title"}>
        <DigitalFog paused={!motionOn}/>
        <div className="hero-eyebrow mono" data-reveal><span><i/> ART. DESIGN. DIGITAL.</span><span>IMAGINATION IN EVERY FORM ↙</span></div>
        <div className="hero-heading" data-reveal data-reveal-direction="left"><h1 id={continuation ? "loop-hero-title" : "hero-title"}><span className="hero-line"><span>ONE STUDIO.</span></span><span className="hero-line"><span>MANY WORLDS.</span></span></h1><div className="hero-intro"><div className="hero-summary"><p className="hero-zh">{t("Ideas take different forms.", "想法，不只一種樣子。")}</p><p>{t("We are Skyray. We bring game production, system development, 3D art and brand design together to turn ideas into experiences that work.", "我們是 Skyray。整合遊戲製作、系統開發、3D 美術與品牌設計，讓想像成為能體驗、能運作的作品。")}</p></div><a href={portfolioPath} className="line-link">{t("Explore the portfolio", "走進作品世界")} <ArrowRight size={17}/></a></div></div>
        <div className="hero-gallery">
          <div className="hero-feature" data-reveal data-reveal-direction="left"><div className="feature-top"><span className="mono">01 / ONE IDEA, DIFFERENT FORMS</span><div className="hero-tabs" data-cursor="SWITCH" data-cursor-kind="control" aria-label={t("Darley Go perspectives", "Darley Go 展示角度")}><button aria-pressed={heroView===0} onClick={()=>setHeroView(0)}>{t("Key visual","世界觀")}</button><button aria-pressed={heroView===1} onClick={()=>setHeroView(1)}>{t("Digital","數位介面")}</button></div></div><button className="feature-image" data-cursor="VIEW" onClick={()=>{openProject(0,heroView);}} aria-label={t("View Darley Go", "查看 Darley Go")}><Artwork key={heroView} asset={projects[0].assets[heroView]} alt={t("Darley Go — key visual and digital design", "Darley Go — 世界觀與數位設計")} eager/><span className="round-arrow"><ArrowUpRight/></span></button><div className="hero-caption"><div className="hero-card-meta"><span>Darley Go</span></div><span className="hero-card-category mono">{heroView===0 ? "ILLUSTRATION" : "WEB & DIGITAL"}</span></div></div>
          <button className="hero-secondary hero-horse" data-reveal data-reveal-direction="right" data-cursor="VIEW" onClick={()=>openProject(1)} aria-label={t("View Racing Horse", "查看 Racing Horse")}><div className="feature-top"><span className="mono">02 / FORM & DETAIL</span></div><div className="hero-small-art"><Artwork asset={projects[1].assets[0]} alt={t("Full racing horse with topology detail", "完整賽馬角色與線框細節")} eager/></div><span className="hero-caption"><span className="hero-card-meta"><span>Racing Horse</span><ArrowUpRight size={18}/></span><span className="hero-card-category mono">3D & CHARACTER</span></span></button>
          <button className="hero-secondary hero-package" data-reveal data-reveal-direction="right" data-cursor="VIEW" onClick={()=>openProject(2)} aria-label={t("View Light in a Box", "查看 Light in a Box")}><div className="feature-top"><span className="mono">03 / BEYOND THE SCREEN</span></div><div className="hero-small-art"><Artwork asset={projects[2].assets[0]} alt={t("Lantern packaging, its complete structure and light", "燈籠包裝完整結構與光影展示")} eager/></div><span className="hero-caption"><span className="hero-card-meta"><span>Light in a Box</span><ArrowUpRight size={18}/></span><span className="hero-card-category mono">BRAND & PACKAGING</span></span></button>
        </div>
        <div className="hero-foot mono" data-reveal><span>SKYRAY — A MULTIDISCIPLINARY PRACTICE</span><a href="#work">{t("SCROLL TO EXPLORE", "向下探索精選作品")} <ArrowDown size={14}/></a></div>
      </section>;
}

export default function Home({ portfolioPage = false }: { portfolioPage?: boolean }) {
  const [zh, setZh] = useState(true), [menu, setMenu] = useState(false), [filter, setFilter] = useState(() => portfolioPage ? readPortfolioState(location.search).category : "all"), [query, setQuery] = useState(() => portfolioPage ? readPortfolioState(location.search).query : "");
  const [selected, setSelected] = useState<number | null>(null), [assetIndex, setAssetIndex] = useState(0), [detail, setDetail] = useState(false), [heroView, setHeroView] = useState(0), [compare, setCompare] = useState(50), [service, setService] = useState(0);
  const [brief, setBrief] = useState(false), [downloaded, setDownloaded] = useState(false), [briefType, setBriefType] = useState("3D & Game Art");
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const motionOn = !reducedMotion;
  const lastFocus = useRef<HTMLElement | null>(null), viewer = useRef<HTMLDivElement>(null);
  const t = (en: string, cn: string) => zh ? cn : en;
  const filtered = filterProjects(filter, query);
  const project = selected === null ? null : projects[selected];
  const activeAsset = project?.assets[assetIndex];
  useEffect(() => { if (localStorage.getItem("skyray-language") === "en") setZh(false); }, []);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update(); preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useEffect(() => { document.documentElement.dataset.motion = motionOn ? "on" : "paused"; }, [motionOn]);
  useEffect(() => { document.documentElement.lang = zh ? "zh-Hant" : "en"; }, [zh]);
  useEffect(() => { if (!menu) return; const handle = (e: KeyboardEvent) => { if (e.key === "Escape") { setMenu(false); document.getElementById("menu-toggle")?.focus(); } }; document.addEventListener("keydown", handle); return () => document.removeEventListener("keydown", handle); }, [menu]);
  function openProject(index: number, initialAsset = 0) { if (!portfolioPage) { location.assign(portfolioUrl({ project: projects[index].id }) + (initialAsset ? `#artwork-${initialAsset + 1}` : "")); return; } lastFocus.current = document.activeElement as HTMLElement; setSelected(index); setAssetIndex(initialAsset); setDetail(false); }
  function changeAsset(index: number) { setAssetIndex(index); setDetail(false); viewer.current?.scrollTo({top:0,left:0}); }
  function changeProject(direction: number) { if (selected === null) return; const collection = filtered.some(p => p.index === selected) ? filtered : projects.map((p,index) => ({...p,index})); const pos = collection.findIndex(p => p.index === selected); setSelected(collection[(pos + direction + collection.length) % collection.length].index); changeAsset(0); }
  function goToWork(category: string) { location.assign(portfolioUrl({ category })); }
  function openBrief() { lastFocus.current = document.activeElement as HTMLElement; setDownloaded(false); setBrief(true); }
  function downloadBrief(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const data = new FormData(e.currentTarget);
    const content = `SKYRAY — Project brief\n\nName: ${data.get("name")}\nEmail: ${data.get("email")}\nInterest: ${data.get("type")}\n\n${data.get("message")}\n\nThis document was downloaded locally. It has not been sent to Skyray.\n`;
    const url = URL.createObjectURL(new Blob([content], {type:"text/plain;charset=utf-8"})); const link = document.createElement("a"); link.href=url; link.download="skyray-project-brief.txt"; link.click(); URL.revokeObjectURL(url); setDownloaded(true);
  }
  return <div className={`site ${motionOn ? "motion-enabled" : "motion-paused"}`}>
    <SiteEffects enabled={motionOn} contentKey={`${filter}-${query}-${zh}-${selected !== null || brief}`}/>
    <a href="#main" className="skip-link">{t("Skip to content", "跳至主要內容")}</a>
    <header className="header">
      <a href={portfolioPage ? import.meta.env.BASE_URL : "#"} className="brand" aria-label="Skyray home"><img src={`${import.meta.env.BASE_URL}images/skyray-logo.svg`} width="240" height="32" alt="SKYRAY" /></a>
      <nav className={menu ? "nav open" : "nav"} aria-label={t("Main navigation", "主要導覽")}>
        <a href={portfolioPath} aria-current={portfolioPage ? "page" : undefined} onClick={() => setMenu(false)}>{t("Portfolio", "作品集")}</a>
        {[["approach","Approach","創作思考"],["studio","Studio","工作室"]].map(([id,en,cn]) => <a key={id} href={`${portfolioPage ? import.meta.env.BASE_URL : ""}#${id}`} onClick={() => setMenu(false)}>{t(en,cn)}</a>)}
        <button onClick={() => {setMenu(false);openBrief();}}>{t("Start a project", "開始合作")}</button>
      </nav>
      <button className="language" onClick={() => {localStorage.setItem("skyray-language",zh ? "en" : "zh");setZh(!zh);}} aria-label={zh ? "Switch to English" : "切換為繁體中文"}>{zh ? "EN" : "繁中"}</button>
      <button className="menu-toggle" id="menu-toggle" aria-label={t("Toggle navigation", "切換導覽選單")} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button>
    </header>
    <main id="main">
      {portfolioPage ? <PortfolioPage zh={zh} filter={filter} query={query} setFilter={setFilter} setQuery={setQuery} openProject={openProject}/> : <>
      <Hero zh={zh} motionOn={motionOn} heroView={heroView} setHeroView={setHeroView} openProject={openProject}/>
      <section id="work" className="work section-pad selected-work">
        <div className="section-kicker mono" data-reveal><span>01 / SELECTED WORK</span><a href={portfolioPath}>{t("EXPLORE ALL 27 PROJECTS", "探索全部 27 組專案")} <ArrowRight size={16}/></a></div>
        <div className="work-heading" data-reveal data-reveal-direction="left"><h2>SELECT<span className="outline">ED</span></h2><p>{t("Different media. A shared attention to craft.", "不同媒介，同樣專注。")}<br/><span>{t("A selection from the studio. Discover every series in our portfolio.", "先從精選作品開始，再走進作品集，探索每個完整系列。")}</span></p></div>
        <div className="portfolio-grid">{[3,5,7,8,13,14].map((index, position) => <PortfolioCard key={projects[index].id} project={projects[index]} index={index} zh={zh} revealDirection={position % 2 === 0 ? "left" : "right"}/>)}</div>
        <div className="archive-foot" data-reveal><span className="mono">27 PROJECTS / 6 DISCIPLINES</span><a href={portfolioPath} className="line-link">{t("Explore the complete portfolio", "瀏覽完整作品集")}<ArrowRight size={20}/></a></div>
      </section>
      <section id="approach" className="approach section-pad">
        <div className="section-kicker mono" data-reveal><span>02 / A CLOSER LOOK</span><span>WORLD BUILDING / LIGHT & ATMOSPHERE</span></div>
        <div className="approach-heading" data-reveal data-reveal-direction="right"><h2>{t("Same place.","同一座城，")}<br/><span>{t("A different story.","另一種故事。")}</span></h2><div><p>{t("Light changes how a world feels. Drag between the day and night studies to see how color, atmosphere and detail reshape the same environment.","光線，決定一個世界的情緒。拖曳比較日夜場景，看看色溫、氣氛與細節，如何改變同一座城的故事。")}</p><span className="mono">WONG FEI HUNG / ENVIRONMENT ART</span></div></div>
        <div className="comparison" data-reveal data-cursor="DRAG" data-cursor-kind="drag" style={{"--position":`${compare}%`} as React.CSSProperties}>
          <div className="compare-scene scene-night" role="img" aria-label={t("Night environment","夜晚場景")}/><div className="compare-scene scene-day" role="img" aria-label={t("Day environment","白天場景")}/><span className="scene-label day"><Sun size={14}/> DAY</span><span className="scene-label night"><Moon size={14}/> NIGHT</span><div className="compare-handle" aria-hidden="true"><span><MoveHorizontal size={22}/></span></div><input aria-label={t("Compare day and night", "比較日夜場景")} type="range" min="0" max="100" value={compare} onChange={e=>setCompare(Number(e.target.value))} aria-valuetext={t(`${compare}% day, ${100-compare}% night`,`${compare}% 白天，${100-compare}% 夜晚`)}/>
        </div>
        <div className="comparison-bottom" data-reveal><span className="mono"><MoveHorizontal size={16}/>{t("DRAG TO CHANGE THE ATMOSPHERE", "左右拖曳，改變場景氛圍")}</span><button className="line-link" onClick={()=>openProject(5)}>{t("See the complete work", "查看完整作品")}<ArrowUpRight size={18}/></button></div>
      </section>
      <section id="studio" className="studio section-pad">
        <div className="section-kicker mono" data-reveal><span>03 / THE STUDIO</span><span>CONNECTED BY CURIOSITY</span></div>
        <div className="studio-intro" data-reveal data-reveal-direction="left"><h2>{t("A small idea can", "從一個想法，")}<br/>{t("open up a world.", "打開整個世界。")}</h2><p>{t("Skyray brings together game production, system development and visual design. Our services span game programming, web systems, custom apps and cloud backends, alongside 3D, branding and multimedia. With our Taiwan branch established in 2022, we connect art and technology to take ideas from concept to working experiences.", "Skyray 整合遊戲製作、系統開發與美術設計，服務涵蓋遊戲程式、網站系統、客製 App 與雲端後台，以及 3D、品牌與多媒體創作。我們於 2022 年設立台灣分公司，讓藝術與技術共同推動每個想法，從概念走向實際體驗。")}</p></div>
        <div className="studio-content"><figure className="studio-photo" data-reveal data-reveal-direction="left"><img src={`${import.meta.env.BASE_URL}images/studio.webp`} width="1600" height="783" alt={t("Inside the Skyray studio", "Skyray 工作室內部")} loading="lazy"/><figcaption className="mono">INSIDE SKYRAY / A SPACE TO CREATE</figcaption></figure><div className="expertise" data-reveal data-reveal-direction="right">{expertise.map((s,i)=><div key={s.en} className={`expertise-item ${service===i ? "active" : ""}`}><button id={`expertise-trigger-${i}`} onClick={()=>setService(service===i ? -1 : i)} aria-expanded={service===i} aria-controls={`expertise-${i}`}><span className="mono">0{i+1}</span><h3>{t(s.en,s.zh)}</h3><span className="expertise-toggle-icon" aria-hidden="true"/></button><div className={`expertise-panel ${service===i ? "is-open" : ""}`} id={`expertise-${i}`} role="region" aria-labelledby={`expertise-trigger-${i}`} aria-hidden={service!==i} inert={service!==i}><div className="expertise-clip"><div className="expertise-detail"><p>{t(s.description,s.descriptionZh)}</p><span className="mono">{s.tags}</span><button className="line-link" onClick={()=>{if(s.projectType){setBriefType(s.projectType);openBrief();}else if(s.filter){goToWork(s.filter);}}}>{s.projectType ? t("Discuss your project","聊聊專案需求") : t("Explore related work","探索相關作品")}{s.projectType ? <ArrowRight size={16}/> : <ArrowUpRight size={16}/>}</button></div></div></div></div>)}</div></div>
        <div className="company-details" data-reveal data-reveal-direction="right">
          <div><span className="mono">ART & TECHNOLOGY / SINCE 2022 IN TAIWAN</span><h3 className="company-name">Skyray Limited</h3><p className="company-legal">香港商天宏軟體製作有限公司台灣分公司</p><p className="company-services">{t("Game production · System development · Custom apps · Web & UX · Cloud backends · 3D & VFX · Visual design", "遊戲製作・系統開發・客製 App・網站與 UX・雲端後台・3D 與 VFX・視覺設計")}</p></div>
          <div><dl className="company-facts"><div><dt>{t("Taiwan branch", "台灣據點")}</dt><dd>{t("Established in 2022", "2022 年設立")}</dd></div><div><dt>{t("Office", "公司地址")}</dt><dd><address>桃園區同德六街89號4樓之A</address></dd></div></dl><a className="line-link" href="https://www.104.com.tw/company/1a2x6bmmas" target="_blank" rel="noopener noreferrer">{t("Join our team", "加入團隊")}<ArrowUpRight size={16}/></a></div>
        </div>
      </section>
      <section id="contact" className="contact section-pad"><div className="section-kicker mono" data-reveal><span>04 / NEXT, YOUR IDEA.</span><span>LET’S CREATE TOGETHER</span></div><div className="contact-main" data-reveal data-reveal-direction="left"><div><p>{t("A character? A website? A whole new world?", "一個角色？一個網站？或是一個全新的世界？")}</p><h2>WHAT’S<br/><span>NEXT?</span></h2></div><button className="contact-invitation" data-magnetic data-cursor="LET’S TALK" data-cursor-kind="contact" onClick={openBrief}><span className="contact-invitation-label">{t("Let’s talk.","聊聊你的想法")}<ArrowRight size={28}/></span><span className="contact-invitation-note">{t("START A PROJECT","開始合作")}</span></button></div><div className="contact-bottom" data-reveal data-reveal-direction="right"><p>{t("Tell us where you want to go. Let’s give the idea a form.","說說你想去的地方，我們一起讓想法成形。")}</p><button className="line-link" onClick={openBrief}>{t("Prepare a project brief","整理合作需求")}<Plus size={18}/></button></div></section>
      </>}
    </main>
    <footer className="footer" data-reveal><a href={portfolioPage ? import.meta.env.BASE_URL : "#"} className="brand" aria-label="Skyray home"><img src={`${import.meta.env.BASE_URL}images/skyray-logo.svg`} width="240" height="32" alt="SKYRAY"/></a><span className="mono">© 2026 SKYRAY</span><a href="#" className="line-link arrow-up">{t("Back to top", "回到頂端")}<ArrowDown className="back-to-top-icon" size={16}/></a></footer>
    {!portfolioPage && <PageLoop enabled={motionOn} blocked={menu || selected!==null || brief}><Hero zh={zh} motionOn={motionOn} heroView={heroView} setHeroView={setHeroView} openProject={openProject} continuation/></PageLoop>}
    <Dialog open={selected!==null} onOpenChange={open=>{if(!open)setSelected(null);}}><DialogContent className="project-dialog" onCloseAutoFocus={e=>{e.preventDefault();lastFocus.current?.focus();}}>{project && activeAsset && <><div className="viewer-header"><div><span className="mono">{categories.find(c=>c.id===project.category)?.en}</span><DialogTitle>{project.name}</DialogTitle></div><button className="viewer-mode" onClick={()=>{setDetail(!detail);viewer.current?.scrollTo({top:0,left:0});}} aria-pressed={detail}>{detail ? <Minus size={15}/> : <Plus size={15}/>} {detail ? t("Fit full image","看完整圖片") : t("Enlarge details","放大看細節")}</button></div><div ref={viewer} tabIndex={0} role="region" aria-label={t("Artwork viewer", "作品檢視區")} className={`viewer-art ${detail ? "detail" : ""}`}><img key={`${activeAsset.src}-${detail}`} src={activeAsset.src} alt={`${project.name} — ${t(activeAsset.label,activeAsset.labelZh)}`} width={activeAsset.width} height={activeAsset.height}/></div><div className="viewer-info" key={`${project.id}-${assetIndex}`}><div><DialogDescription>{t(project.en,project.zh)}</DialogDescription><span className="mono">{t(activeAsset.label,activeAsset.labelZh)} · {assetIndex+1}/{project.assets.length}</span></div></div>{project.assets.length>1 && <div className="asset-strip" aria-label={t("Project images","作品圖片")}>{project.assets.map((a,i)=><button key={a.src} aria-label={`${t("View image","查看圖片")} ${i+1}: ${t(a.label,a.labelZh)}`} aria-pressed={i===assetIndex} onClick={()=>changeAsset(i)}><img src={a.src} alt=""/><span className="mono">{String(i+1).padStart(2,"0")}</span></button>)}</div>}<div className="viewer-project-nav" role="group" aria-label={t("Browse projects", "切換作品")}><button aria-label={t("Previous project","上一個作品")} onClick={()=>changeProject(-1)}><ArrowLeft size={18}/></button><span className="mono" aria-live="polite" aria-atomic="true">{String(selected!+1).padStart(2,"0")} / {projects.length}</span><button aria-label={t("Next project","下一個作品")} onClick={()=>changeProject(1)}><ArrowRight size={18}/></button></div></>}</DialogContent></Dialog>
    <Dialog open={brief} onOpenChange={setBrief}><DialogContent className="brief-dialog" onCloseAutoFocus={e=>{e.preventDefault();lastFocus.current?.focus();}}><span className="mono">YOUR IDEA, NEXT.</span><DialogTitle>{t("Give it a starting point.","讓想法，有個起點。")}</DialogTitle><DialogDescription>{t("Prepare your project brief. This preview downloads a document on your device; it does not send it to Skyray.","先整理一份合作需求。目前版本會在你的裝置下載文件，尚未寄送給 Skyray。")}</DialogDescription><form onSubmit={downloadBrief}><div className="form-row"><label>{t("Name","姓名")}<input name="name" autoComplete="name" required maxLength={100} placeholder={t("Your name","怎麼稱呼你？")}/></label><label>{t("Email","電子信箱")}<input name="email" type="email" autoComplete="email" required maxLength={200} placeholder="you@company.com"/></label></div><label>{t("Project type","合作方向")}<span className="select-field"><select name="type" value={briefType} onChange={e=>setBriefType(e.target.value)}><option value="Game Production">{t("Game production","遊戲製作")}</option><option value="System Development">{t("System development","系統開發")}</option><option>3D & Game Art</option><option>Web & Digital</option><option>Brand & Packaging</option><option>Illustration & Visual</option><option>{t("A little of everything","跨領域合作")}</option></select><ChevronDown size={20} aria-hidden="true"/></span></label><label>{t("Your idea","你的想法")}<textarea name="message" rows={4} required maxLength={5000} placeholder={t("The idea, the goal, the timeline…","想法、目標、預計時程…")}/></label><button className="solid-button" type="submit">{downloaded ? <Check size={17}/> : <Download size={17}/>} {t("Download project brief","下載合作需求文件")}</button>{downloaded && <p role="status" className="form-status">{t("Downloaded. It has not been sent to Skyray.","已下載文件，尚未寄送給 Skyray。")}</p>}</form></DialogContent></Dialog>
  </div>;
}
