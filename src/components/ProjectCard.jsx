import { Link } from 'react-router-dom';
import ProgressiveImage from './ProgressiveImage';
import ProjectVisual from './ProjectVisual';

export default function ProjectCard({ project, featured = false }) {
  return (
    <article className={`project-card ${featured ? 'project-card--featured' : ''}`}>
      <Link
        aria-label={`View project: ${project.title}`}
        className="project-card__link"
        to={`/portfolio/${project.slug}`}
      >
        <div className="project-card__media">
          {project.image ? (
            <ProgressiveImage
              alt={project.title}
              className="project-card__image"
              decoding="async"
              loading="lazy"
              src={project.image}
            />
          ) : (
            <ProjectVisual
              theme={project.theme}
              title={`${project.title} visual`}
              variant={featured ? 'hero' : 'card'}
            />
          )}
        </div>

        <div className="project-card__body">
          <div className="project-card__meta">
            <span>{project.category}</span>
            <span>{project.year}</span>
          </div>
          <h3 className="project-card__title">{project.title}</h3>
          <p className="project-card__description">{project.shortDescription}</p>
          <span className="text-link">View Project</span>
        </div>
      </Link>
    </article>
  );
}
