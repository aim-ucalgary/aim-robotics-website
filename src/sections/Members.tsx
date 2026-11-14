import SectionLabel from "../components/SectionLabel";
import TechnicalLabel from "../components/TechnicalLabel";
import { members } from "../content/loader";
import "./Members.css";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** 06 / Teams — Members: profile cards grouped by leadership and subteam. No nav link; sits under Teams. */
function Members() {
  return (
    <section id="members" className="members" aria-labelledby="members-heading">
      <div className="container">
        <SectionLabel>{members.sectionLabel}</SectionLabel>
        <h2 id="members-heading" className="members__heading">
          {members.heading}
        </h2>
        <p className="members__intro">{members.intro}</p>

        {members.groups.map((group) => (
          <div key={group.id} className="members__group">
            <div className="members__group-header">
              <TechnicalLabel accent>{group.tag}</TechnicalLabel>
              <h3 id={`members-${group.id}`} className="members__group-title">
                {group.title}
              </h3>
            </div>

            <ul className="members__grid">
              {group.members.map((member, index) => (
                <li key={`${group.id}-${index}`} className="members__card">
                  <div className="members__photo">
                    {member.photo ? (
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="members__image"
                        loading="lazy"
                      />
                    ) : (
                      <span className="members__initials" aria-hidden="true">
                        {initials(member.name)}
                      </span>
                    )}
                  </div>
                  <div className="members__info">
                    <h4 className="members__name">{member.name}</h4>
                    <p className="members__role">{member.role}</p>
                    {member.program && <p className="members__program">{member.program}</p>}
                    {member.linkedin && (
                      <a
                        className="members__link"
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} on LinkedIn`}
                      >
                        LinkedIn ↗
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Members;
