import generatedProjects from './generatedProjects.json';
import { manualProjects } from './manualProjects';

export const projects = [...generatedProjects, ...manualProjects].sort(
  (a, b) => Number(b.year) - Number(a.year) || a.title.localeCompare(b.title),
);

export const featuredProjectSlugs = projects
  .filter((project) => project.featured)
  .map((project) => project.slug);

export function getFeaturedProjects() {
  return projects.filter((project) =>
    featuredProjectSlugs.includes(project.slug),
  );
}

export function getProjectBySlug(slug) {
  return projects.find((project) => project.slug === slug);
}
