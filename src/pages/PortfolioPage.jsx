import { useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import { projects } from '../data/projects';
import { projectFilters } from '../data/siteContent';

export default function PortfolioPage() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredProjects =
    activeFilter === 'All'
      ? projects
      : projects.filter((project) => project.tags.includes(activeFilter));

  return (
    <>
      <div className="page-frame page-frame--portfolio">
        <section className="portfolio-head">
          <div className="portfolio-head__copy">
            <p className="eyebrow">Portfolio</p>
            <h1 className="portfolio-head__title">Portfolio</h1>
          </div>
          <p className="portfolio-head__description">
            Academic projects, professional work, and research-driven design
            investigations centered on sustainability, climate adaptation, and
            resilient urban systems.
          </p>
        </section>

        <section className="portfolio-body">
          <div className="filter-bar" aria-label="Project filters" role="toolbar">
            {projectFilters.map((filterName) => (
              <button
                className={`filter-button ${activeFilter === filterName ? 'is-active' : ''}`}
                key={filterName}
                onClick={() => setActiveFilter(filterName)}
                type="button"
              >
                {filterName}
              </button>
            ))}
          </div>

          <div className="project-grid project-grid--portfolio">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
