import { siteMeta } from '../data/siteContent';

const aboutSections = [
  {
    title: 'Academic & Research Interests',
    content: siteMeta.aboutAcademic,
    icon: 'leaf',
  },
  {
    title: 'Professional Experience',
    content: siteMeta.aboutExperience,
    icon: 'briefcase',
  },
  {
    title: 'Current Direction',
    content: siteMeta.aboutDirection,
    icon: 'compass',
  },
];

function AboutIcon({ type }) {
  if (type === 'briefcase') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path
          d="M8 7.5V6.8C8 5.81 8.81 5 9.8 5H14.2C15.19 5 16 5.81 16 6.8V7.5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <rect
          fill="none"
          height="11.5"
          rx="2.4"
          stroke="currentColor"
          strokeWidth="1.5"
          width="16"
          x="4"
          y="7.5"
        />
        <path
          d="M4 12.5H20"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (type === 'compass') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <circle
          cx="12"
          cy="12"
          fill="none"
          r="8"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M14.8 9.2L13.1 13.1L9.2 14.8L10.9 10.9L14.8 9.2Z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M14.9 5.8C12.6 5.7 10.6 6.5 9.2 8.1C7.6 9.8 7.1 12 7.5 14.2C9.7 14.6 12 14.1 13.7 12.5C15.3 11.1 16.1 9.1 16 6.8L14.9 5.8Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M9.8 13.6L6.6 16.8M12 11.4L17.3 6.2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <>
      <div className="page-frame page-frame--about">
        <section className="about-hero">
          <div className="about-hero__copy">
            <p className="eyebrow">About</p>
            <h1 className="about-hero__title">About Me</h1>
            <p className="about-hero__intro">{siteMeta.aboutProfile}</p>
            <p className="about-hero__support">
              I believe thoughtful design grounded in research and empathy can
              create built environments that are both environmentally responsive
              and socially meaningful.
            </p>
            <p className="about-hero__note">
              Design with nature.
              <br />
              Research for impact.
              <br />
              Build resilient futures.
            </p>
          </div>

          <div className="about-portrait-stage" aria-hidden="true">
            <div className="about-portrait-stage__backdrop" />
            <div className="about-portrait-stage__frame">
              <img
                alt={siteMeta.aboutPortraitAlt}
                className="page-banner__portrait"
                decoding="async"
                loading="eager"
                src={siteMeta.aboutPortraitImage}
              />
            </div>
          </div>
        </section>

        <section className="about-focus-grid">
          {aboutSections.map((section) => (
            <article className="about-focus-card" key={section.title}>
              <div className="about-focus-card__icon">
                <AboutIcon type={section.icon} />
              </div>
              <h2>{section.title}</h2>
              <p>{section.content}</p>
            </article>
          ))}
        </section>
      </div>
    </>
  );
}
