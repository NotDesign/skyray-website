import { ArrowRight } from "lucide-react";
import { categories, type Project } from "@/lib/portfolio";
import { portfolioUrl } from "@/lib/portfolio-navigation";

import WebsiteMockup from "@/components/website-mockup";

export default function PortfolioCard({ project, index, zh, category = "all", query = "" }: {
  project: Project; index: number; zh: boolean; category?: string; query?: string;
}) {
  const cover = project.assets[0];
  const discipline = categories.find(c => c.id === project.category)!;
  return <a className="project-card portfolio-card" href={portfolioUrl({ project: project.id, category, query })}
    data-reveal data-cursor="VIEW" aria-label={`${zh ? "查看專案" : "View project"} ${project.name}`}>
    <div className="portfolio-card-label mono"><span>{String(index + 1).padStart(2, "0")} / {discipline.en}</span><span>{String(project.assets.length).padStart(2, "0")} {zh ? "張作品圖" : "IMAGES"}</span></div>
    <div className="project-image portfolio-cover">{project.presentation === "website" ? <WebsiteMockup zh={zh} asset={cover} secondary={project.assets.at(-1)} laptop /> : <img src={cover.src} width={cover.width} height={cover.height} alt={project.name} loading="lazy" decoding="async" />}</div>
    <div className="portfolio-card-title"><h3>{project.name}</h3><ArrowRight size={22} aria-hidden="true" /></div>
    <p>{zh ? project.zh : project.en}</p>
  </a>;
}
