import generatedProjects from './generatedProjects.json';

export const projects = generatedProjects;

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
