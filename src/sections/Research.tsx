import { useCallback, useEffect, useRef, useState } from "react";
import SectionLabel from "../components/SectionLabel";
import { research } from "../content/loader";
import "./Research.css";

/** Full web addresses open in a new tab; paths like "/research/x" stay on the AIM site. */
const isExternal = (href: string) => /^https?:\/\//i.test(href);

/** 05 / Research — intro line, then a horizontally scrollable row of research topics. */
function Research() {
  const trackRef = useRef<HTMLUListElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateButtons = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanPrev(track.scrollLeft > 4);
    setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updateButtons();
    track.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    return () => {
      track.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [updateButtons]);

  const scroll = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".research__card");
    const step = card ? card.offsetWidth + 24 : track.clientWidth * 0.8;
    track.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  return (
    <section id="research" className="research" aria-labelledby="research-heading">
      <div className="container">
        <SectionLabel>{research.sectionLabel}</SectionLabel>

        <div className="research__top reveal">
          <div>
            <h2 id="research-heading" className="research__heading">
              {research.heading}
            </h2>
            <p className="research__intro">{research.intro}</p>
          </div>

          <div className="research__controls">
            <button
              type="button"
              className="research__arrow"
              onClick={() => scroll(-1)}
              disabled={!canPrev}
              aria-label="Scroll research topics left"
            >
              ←
            </button>
            <button
              type="button"
              className="research__arrow"
              onClick={() => scroll(1)}
              disabled={!canNext}
              aria-label="Scroll research topics right"
            >
              →
            </button>
          </div>
        </div>

        <ul ref={trackRef} className="research__track reveal" tabIndex={0} aria-label="Research topics">
          {research.topics.map((topic, index) => {
            const figure = `FIG. ${String(index + 1).padStart(2, "0")}`;
            const external = topic.href ? isExternal(topic.href) : false;

            const card = (
              <>
                <div className="research__media">
                  {topic.image ? (
                    <img
                      src={topic.image}
                      alt={topic.imageAlt ?? topic.title}
                      className="research__image"
                      loading="lazy"
                    />
                  ) : (
                    <span className="research__placeholder">Image coming soon</span>
                  )}
                </div>
                <div className="research__caption">
                  <span className="research__figure">
                    {topic.tag ? `${figure} · ${topic.tag}` : figure}
                  </span>
                  <h3 className="research__title">{topic.title}</h3>
                </div>
              </>
            );

            return (
              <li key={topic.id} className="research__card">
                {topic.href ? (
                  <a
                    className="research__link"
                    href={topic.href}
                    {...(external && { target: "_blank", rel: "noopener noreferrer" })}
                  >
                    {card}
                    {external && <span className="visually-hidden"> (opens in a new tab)</span>}
                  </a>
                ) : (
                  <div className="research__link">{card}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default Research;
