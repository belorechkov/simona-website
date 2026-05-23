export default function PageIntro({
  eyebrow,
  title,
  description,
  align = 'left',
}) {
  return (
    <div className={`page-intro page-intro--${align}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1 className="section-title">{title}</h1>
      {description ? <p className="section-description">{description}</p> : null}
    </div>
  );
}
