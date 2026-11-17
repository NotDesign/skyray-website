import { categories, projects } from "./portfolio";

export const portfolioPath = `${import.meta.env.BASE_URL}portfolio/`;

export function portfolioUrl({ category = "all", query = "", project }: { category?: string; query?: string; project?: string } = {}) {
  const params = new URLSearchParams();
  if (category !== "all") params.set("category", category);
  if (query.trim()) params.set("q", query.trim());
  if (project) params.set("project", project);
  return portfolioPath + (params.size ? `?${params}` : "");
}

export function readPortfolioState(search: string) {
  const params = new URLSearchParams(search);
  const category = params.get("category") || "all";
  return {
    category: categories.some(c => c.id === category) ? category : "all",
    query: params.get("q") || "",
    project: params.get("project"),
  };
}

export function filterProjects(category: string, query: string) {
  const needle = query.trim().toLocaleLowerCase();
  return projects.map((project, index) => ({ ...project, index })).filter(project => {
    const discipline = categories.find(c => c.id === project.category);
    return (category === "all" || project.category === category) &&
      `${project.name} ${project.en} ${project.zh} ${project.tags.join(" ")} ${discipline?.en} ${discipline?.zh}`.toLocaleLowerCase().includes(needle);
  });
}
