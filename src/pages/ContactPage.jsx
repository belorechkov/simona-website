import { useState } from 'react';
import { siteMeta } from '../data/siteContent';

const initialFormData = {
  name: '',
  email: '',
  subject: '',
  message: '',
  'bot-field': '',
};

function encodeFormData(data) {
  return new URLSearchParams(data).toString();
}

const contactItems = [
  {
    label: 'LinkedIn',
    value: siteMeta.contactLinkedInLabel,
    href: siteMeta.contactLinkedInUrl,
    icon: 'linkedin',
    external: true,
  },
  {
    label: 'Email',
    value: siteMeta.contactEmail,
    href: `mailto:${siteMeta.contactEmail}`,
    icon: 'mail',
  },
  {
    label: 'Location',
    value: siteMeta.location,
    icon: 'pin',
  },
];

function ContactIcon({ type }) {
  if (type === 'linkedin') {
    return (
      <span
        aria-hidden="true"
        className="contact-icon-mark hero__social-mark hero__social-mark--linkedin"
      >
        in
      </span>
    );
  }

  if (type === 'pin') {
    return (
      <svg aria-hidden="true" className="contact-icon-svg contact-icon-svg--pin" viewBox="0 0 24 24">
        <path
          d="M12 20C15.7 15.7 17.5 12.7 17.5 9.9C17.5 6.64 15.04 4 12 4C8.96 4 6.5 6.64 6.5 9.9C6.5 12.7 8.3 15.7 12 20Z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <circle cx="12" cy="10" fill="none" r="2.2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="contact-icon-svg contact-icon-svg--mail" viewBox="0 0 24 24">
      <rect
        fill="none"
        height="14"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.5"
        width="18"
        x="3"
        y="5"
      />
      <path
        d="M5.5 8L12 13L18.5 8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function ContactPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [submitState, setSubmitState] = useState('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setSubmitState('idle');
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitState('idle');

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: encodeFormData({
          'form-name': 'contact',
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Netlify form submission failed.');
      }

      setFormData(initialFormData);
      setSubmitState('success');
    } catch (error) {
      setSubmitState('error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-frame page-frame--contact">
      <section className="contact-layout contact-layout--form contact-layout--reference">
        <div className="contact-sidebar contact-sidebar--sheet">
          <h1 className="section-title">
            Let&apos;s build
            <br />
            resilient futures
            <span className="contact-sidebar__accent">together.</span>
          </h1>
          <p className="section-description">{siteMeta.contactLead}</p>

          <address className="contact-details-list">
            {contactItems.map((item) => (
              <article className="contact-detail" key={item.label}>
                <div className="contact-detail__icon">
                  <ContactIcon type={item.icon} />
                </div>
                {item.href ? (
                  <a
                    className="contact-detail__link"
                    href={item.href}
                    rel="noreferrer"
                    target={item.external ? '_blank' : undefined}
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="contact-detail__text">{item.value}</p>
                )}
              </article>
            ))}
          </address>
        </div>

        <form
          className="contact-form-shell contact-form-shell--reference"
          data-netlify="true"
          method="POST"
          name="contact"
          netlify-honeypot="bot-field"
          onSubmit={handleSubmit}
        >
          <input name="form-name" type="hidden" value="contact" />
          <div aria-hidden="true" className="visually-hidden">
            <label htmlFor="contact-bot-field">Do not fill this out</label>
            <input
              id="contact-bot-field"
              name="bot-field"
              onChange={handleChange}
              tabIndex={-1}
              type="text"
              value={formData['bot-field']}
            />
          </div>

          <div className="contact-form-grid">
            <div className="form-field">
              <label className="visually-hidden" htmlFor="contact-name">
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                onChange={handleChange}
                placeholder="Name"
                required
                type="text"
                value={formData.name}
              />
            </div>

            <div className="form-field">
              <label className="visually-hidden" htmlFor="contact-email">
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                onChange={handleChange}
                placeholder="Email"
                required
                type="email"
                value={formData.email}
              />
            </div>

            <div className="form-field form-field--full">
              <label className="visually-hidden" htmlFor="contact-subject">
                Subject
              </label>
              <input
                id="contact-subject"
                name="subject"
                onChange={handleChange}
                placeholder="Subject"
                required
                type="text"
                value={formData.subject}
              />
            </div>

            <div className="form-field form-field--full">
              <label className="visually-hidden" htmlFor="contact-message">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                onChange={handleChange}
                placeholder="Message"
                required
                rows="7"
                value={formData.message}
              />
            </div>
          </div>

          <div className="contact-form__actions">
            <button className="button button--solid" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </div>

          {submitState === 'success' ? (
            <p className="contact-form__status contact-form__status--success" role="status">
              Message sent successfully. I&apos;ll get back to you by email.
            </p>
          ) : null}

          {submitState === 'error' ? (
            <p className="contact-form__status contact-form__status--error" role="alert">
              Something went wrong while sending your message. Please try again.
            </p>
          ) : null}
        </form>

        <div className="contact-stage" aria-hidden="true">
          <div className="contact-stage__backdrop" />
          <div className="contact-stage__visual">
            <img
              alt={siteMeta.contactImageAlt}
              className="contact-stage__image"
              decoding="async"
              src={siteMeta.contactImage}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
