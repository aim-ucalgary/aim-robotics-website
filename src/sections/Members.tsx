import MemberCard from "../components/MemberCard";
import SectionLabel from "../components/SectionLabel";
import TechnicalLabel from "../components/TechnicalLabel";
import { members } from "../content/loader";
import "./Members.css";

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
                <li key={`${group.id}-${index}`}>
                  <MemberCard member={member} />
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
