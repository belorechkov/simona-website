import { useEffect, useMemo, useState } from 'react';
import { comingSoonConfig } from '../config/siteConfig';
import { siteMeta } from '../data/siteContent';

const timeUnits = [
  ['days', 'Days'],
  ['hours', 'Hours'],
  ['minutes', 'Minutes'],
  ['seconds', 'Seconds'],
];

function getRemainingTime(targetDate) {
  const distance = Math.max(0, targetDate.getTime() - Date.now());

  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((distance / (1000 * 60)) % 60),
    seconds: Math.floor((distance / 1000) % 60),
  };
}

export default function ComingSoonPage() {
  const targetDate = useMemo(
    () => new Date(comingSoonConfig.launchDeadlineIso),
    [],
  );
  const [remainingTime, setRemainingTime] = useState(() =>
    getRemainingTime(targetDate),
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRemainingTime(getRemainingTime(targetDate));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [targetDate]);

  return (
    <main className="coming-soon">
      <section className="coming-soon__panel">
        <div className="coming-soon__copy">
          <p className="eyebrow">Portfolio launching soon</p>
          <h1>Simona Taseva</h1>
          <p className="coming-soon__subtitle">
            Architect | Sustainable Architecture & Urban Research
          </p>
          <p className="coming-soon__lead">
            The full website is being prepared and will be done by:
          </p>

          <div className="coming-soon__timer" aria-label="Launch countdown">
            {timeUnits.map(([unit, label]) => (
              <div className="coming-soon__time-unit" key={unit}>
                <span>{String(remainingTime[unit]).padStart(2, '0')}</span>
                <p>{label}</p>
              </div>
            ))}
          </div>

          <a className="coming-soon__email" href={`mailto:${siteMeta.contactEmail}`}>
            {siteMeta.contactEmail}
          </a>
        </div>

        <div className="coming-soon__visual" aria-hidden="true">
          <img alt="" src={siteMeta.heroImage} />
        </div>
      </section>
    </main>
  );
}
