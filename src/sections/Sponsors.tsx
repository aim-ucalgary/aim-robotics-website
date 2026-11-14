import ArrowLink from "../components/ArrowLink";
import SectionLabel from "../components/SectionLabel";
import TechnicalLabel from "../components/TechnicalLabel";
import { sponsors } from "../content/loader";
import "./Sponsors.css";

const tierName = (id: string) => sponsors.tiers.find((tier) => tier.id === id);

/** 07 / Sponsors — tiers, benefits, and where sponsor support goes. */
function Sponsors() {
  return (
    <section id="sponsors" className="sponsors" aria-labelledby="sponsors-heading">
      <div className="container">
        <SectionLabel>{sponsors.sectionLabel}</SectionLabel>

        <div className="sponsors__top">
          <h2 id="sponsors-heading" className="sponsors__heading">
            {sponsors.heading}
          </h2>
          <div className="sponsors__top-side">
            <p className="sponsors__intro">{sponsors.intro}</p>
            <div className="sponsors__ctas">
              <ArrowLink href={sponsors.primaryCta.href} variant="primary">
                {sponsors.primaryCta.label}
              </ArrowLink>
              <a
                className="arrow-link"
                href={sponsors.packageCta.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {sponsors.packageCta.label}
                <span className="arrow-link__arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Objectives */}
        <div className="sponsors__block">
          <TechnicalLabel className="sponsors__block-label">{sponsors.objectivesLabel}</TechnicalLabel>
          <p className="sponsors__objectives-intro">{sponsors.supportText}</p>
          <div className="sponsors__objectives">
            {sponsors.objectives.map((objective) => (
              <div key={objective.id} className="sponsors__objective">
                <TechnicalLabel accent>{objective.tag}</TechnicalLabel>
                <h4 className="sponsors__objective-title">{objective.title}</h4>
                <p className="sponsors__objective-description">{objective.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tiers */}
        <div className="sponsors__block">
          <TechnicalLabel className="sponsors__block-label">{sponsors.tiersLabel}</TechnicalLabel>
          <div className="sponsors__tiers">
            {sponsors.tiers.map((tier) => (
              <div key={tier.id} className={`sponsors__tier sponsors__tier--${tier.id}`}>
                <div className="sponsors__tier-info">
                  <span className="sponsors__tier-price">{tier.price}</span>
                  <h4 className="sponsors__tier-name">{tier.name}</h4>
                  <p className="sponsors__tier-description">{tier.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits table */}
        <div className="sponsors__block sponsors__benefits">
          <div className="sponsors__benefits-head">
            <TechnicalLabel>{sponsors.benefitsLabel}</TechnicalLabel>
            <h3 className="sponsors__benefits-heading">{sponsors.benefitsHeading}</h3>
          </div>
          <div className="sponsors__table-wrap" tabIndex={0} role="region" aria-label="Sponsor benefits by tier">
            <table className="sponsors__table">
              <thead>
                <tr>
                  <th scope="col">Benefit</th>
                  {sponsors.benefitColumns.map((id) => {
                    const tier = tierName(id);
                    return (
                      <th key={id} scope="col">
                        <span className="sponsors__table-tier">{tier?.name.replace(" Tier", "")}</span>
                        <span className="sponsors__table-price">{tier?.price}</span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sponsors.benefits.map((benefit) => (
                  <tr key={benefit.label}>
                    <th scope="row">{benefit.label}</th>
                    {sponsors.benefitColumns.map((id) =>
                      benefit.tiers.includes(id) ? (
                        <td key={id} className="sponsors__check">
                          <span aria-hidden="true">✓</span>
                          <span className="visually-hidden">Included</span>
                        </td>
                      ) : (
                        <td key={id} className="sponsors__dash">
                          <span aria-hidden="true">—</span>
                          <span className="visually-hidden">Not included</span>
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Budget + in-kind */}
        <div className="sponsors__bottom">
          <div className="sponsors__budget">
            <TechnicalLabel className="sponsors__block-label">{sponsors.budgetLabel}</TechnicalLabel>
            <div className="sponsors__budget-total">
              <span className="sponsors__budget-value">{sponsors.budgetTotal}</span>
              <span className="sponsors__budget-caption">{sponsors.budgetTotalLabel}</span>
            </div>
            <ul className="sponsors__bars">
              {sponsors.budget.map((item) => (
                <li key={item.label} className="sponsors__bar">
                  <div className="sponsors__bar-row">
                    <span className="sponsors__bar-label">{item.label}</span>
                    <span className="sponsors__bar-percent">{item.percent}%</span>
                  </div>
                  <div className="sponsors__bar-track" aria-hidden="true">
                    <div className="sponsors__bar-fill" style={{ width: `${item.percent}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="sponsors__inkind">
            <h3 className="sponsors__inkind-heading">{sponsors.inKindHeading}</h3>
            <p className="sponsors__inkind-text">{sponsors.inKindText}</p>
            <ArrowLink href={sponsors.primaryCta.href} variant="primary">
              {sponsors.primaryCta.label}
            </ArrowLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Sponsors;
