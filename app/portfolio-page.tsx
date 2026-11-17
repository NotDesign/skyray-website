import { useEffect } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Search, X, Plus } from "lucide-react";
import PortfolioCard from "@/components/portfolio-card";
import { categories, projects, assetCount } from "@/lib/portfolio";
import { filterProjects, portfolioPath, portfolioUrl, readPortfolioState } from "@/lib/portfolio-navigation";

type Props = {
  zh: boolean; filter: string; query: string;
  setFilter: (value: string) => void; setQuery: (value: string) => void;
  openProject: (index: number, asset?: number) => void;
};

export default function PortfolioPage({ zh, filter, query, setFilter, setQuery, openProject }: Props) {
  const t = (en: string, cn: string) => zh ? cn : en;
  const requested = readPortfolioState(window.location.search).project;
  const projectIndex = projects.findIndex(p => p.id === requested);
  const project = projects[projectIndex];
  const filtered = filterProjects(filter, query);
  const collectionUrl = portfolioUrl({ category: filter, query });
  useEffect(() => {
    document.title = requested ? `${project?.name || t("Project not found", "找不到專案")} — Skyray` : t("Portfolio — Skyray", "作品集 — Skyray");
  }, [zh, requested, project]);
  useEffect(() => {
    if (!project || !/^#artwork-\d+$/.test(window.location.hash)) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: "instant", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [project]);

  function updateCollection(category: string, text: string) {
    setFilter(category); setQuery(text);
    history.replaceState(history.state, "", portfolioUrl({ category, query: text }));
  }

  if (requested && !project) return <section className="portfolio-page portfolio-missing">
    <span className="mono">PROJECT NOT FOUND</span><h1>{t("This project is not here.", "找不到這個專案。")}</h1>
    <p>{t("Explore the complete collection to find your next inspiration.", "回到完整作品集，繼續探索我們的創作。")}</p>
    <a className="line-link" href={portfolioPath}><ArrowLeft size={18}/>{t("Back to all work", "返回作品集")}</a>
  </section>;

  if (project) {
    const discipline = categories.find(c => c.id === project.category)!;
    const collection = filtered.some(p => p.id === project.id) ? filtered : filterProjects("all", "");
    const position = collection.findIndex(p => p.id === project.id);
    const next = collection[(position + 1) % collection.length];
    return <article className="portfolio-page case-page">
      <nav className="portfolio-breadcrumb" aria-label={t("Breadcrumb", "所在位置")}><a href={collectionUrl}><ArrowLeft size={16}/>{t("All work", "作品集")}</a><span aria-hidden="true">/</span><span aria-current="page">{project.name}</span></nav>
      <header className="case-heading" data-reveal>
        <div><span className="mono">{String(projectIndex + 1).padStart(2, "0")} / {discipline.en}</span><h1>{project.name}</h1></div>
        <div className="case-summary"><p>{t(project.en, project.zh)}</p><ul className="case-tags">{project.tags.map(tag => <li key={tag}>{tag}</li>)}</ul><span className="mono">{project.assets.length} {t("IMAGES IN THIS PROJECT", "張作品圖・完整系列")}</span></div>
      </header>
      {project.assets.length > 1 && <nav className="case-index" aria-label={t("Project sections", "專案內容")}>
        {project.assets.map((asset, index) => <a key={asset.src} href={`#artwork-${index + 1}`}><span className="mono">{String(index + 1).padStart(2, "0")}</span>{t(asset.label, asset.labelZh)}</a>)}
      </nav>}
      <div className="case-gallery">
        {project.assets.map((asset, index) => <figure key={asset.src} id={`artwork-${index + 1}`} className="case-artwork">
          <figcaption><span><span className="mono">{String(index + 1).padStart(2, "0")}</span>{t(asset.label, asset.labelZh)}</span><button onClick={() => openProject(projectIndex, index)} className="line-link">{t("View details", "放大細節")}<Plus size={18}/></button></figcaption>
          <button className="case-artwork-open" onClick={() => openProject(projectIndex, index)} data-cursor="VIEW" aria-label={`${t("Enlarge", "放大")} ${t(asset.label, asset.labelZh)}`}>
            <img src={asset.src} width={asset.width} height={asset.height} alt={`${project.name} — ${t(asset.label, asset.labelZh)}`} loading={index === 0 ? "eager" : "lazy"} decoding="async" />
          </button>
        </figure>)}
      </div>
      <nav className="case-next" aria-label={t("Continue exploring", "繼續探索")} data-reveal>
        <a className="line-link" href={collectionUrl}><ArrowLeft size={18}/>{t("Back to collection", "返回作品集")}</a>
        {collection.length > 1 && <a className="case-next-project" data-cursor="NEXT" href={portfolioUrl({ category: filter, query, project: next.id })}>
          <span className="mono">{t("NEXT PROJECT", "下一個專案")}</span><span>{next.name}<ArrowRight size={28}/></span>
        </a>}
      </nav>
    </article>;
  }

  return <div className="portfolio-page">
    <nav className="portfolio-breadcrumb" aria-label={t("Breadcrumb", "所在位置")}><a href={import.meta.env.BASE_URL}>{t("Home", "首頁")}</a><span aria-hidden="true">/</span><span aria-current="page">{t("Portfolio", "作品集")}</span></nav>
    <header className="portfolio-heading" data-reveal>
      <div><span className="mono">THE COMPLETE COLLECTION</span><h1>WORK<span className="outline">S</span><sup>{projects.length}</sup></h1></div>
      <div><p>{t("Every project, a world of its own.", "每個專案，都有自己的世界。")}</p><p>{t("Explore the full series — from characters and game worlds to digital experiences and brand identities.", "從角色與遊戲世界，到網站與品牌視覺。走進每個專案，完整看見創作的不同面向。")}</p><span className="mono">{projects.length} PROJECTS / {assetCount} IMAGES / {categories.length - 1} DISCIPLINES</span></div>
    </header>
    <section className="portfolio-collection" aria-label={t("Project collection", "專案作品集")}>
      <div className="work-toolbar portfolio-toolbar">
        <div className="filter-group" data-cursor="FILTER" data-cursor-kind="control" role="group" aria-label={t("Filter projects", "篩選作品")}>{categories.map(c => <button key={c.id} aria-pressed={filter === c.id} onClick={() => updateCollection(c.id, query)}>{t(c.en,c.zh)}<sup>{c.id === "all" ? projects.length : projects.filter(p => p.category === c.id).length}</sup></button>)}</div>
        <label className="work-search"><Search size={20} aria-hidden="true"/><input type="search" value={query} onChange={e => updateCollection(filter, e.target.value)} aria-label={t("Search projects", "搜尋作品")} placeholder={t("Search name or discipline", "搜尋專案、類型或關鍵字")}/>{query && <button className="search-clear" aria-label={t("Clear search", "清除搜尋")} onClick={() => updateCollection(filter, "")}><X size={18}/></button>}</label>
      </div>
      <div className="results-label mono" role="status" aria-live="polite"><span>{filtered.length} / {projects.length} {t("PROJECTS", "組專案")}</span><span>{t("OPEN A PROJECT. EXPLORE THE WHOLE STORY.", "選擇專案，瀏覽完整系列。")}</span></div>
      <div className="portfolio-grid" key={filter}>{filtered.map(p => <PortfolioCard key={p.id} project={p} index={p.index} zh={zh} category={filter} query={query}/>)}</div>
      {filtered.length === 0 && <div className="no-results"><p>{t("No matching projects. Try another keyword or category.", "沒有符合的專案，試試其他關鍵字或分類。")}</p><button className="line-link" onClick={() => updateCollection("all", "")}>{t("Show all projects", "顯示全部作品")}<ArrowRight size={18}/></button></div>}
    </section>
    <div className="portfolio-outro" data-reveal><p>{t("What will we create next?", "下一個世界，從你的想法開始。")}</p><a className="line-link" href={`${import.meta.env.BASE_URL}#contact`}>{t("Let’s talk", "聊聊合作想法")}<ArrowUpRight size={18}/></a></div>
  </div>;
}
