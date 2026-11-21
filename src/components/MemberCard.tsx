import type { Member } from "../content/types";
import "../sections/Members.css";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

interface MemberCardProps {
  member: Member;
}

/** One member's profile card. Used by the Members section and the profile editor's preview. */
function MemberCard({ member }: MemberCardProps) {
  return (
    <div className="members__card">
      <div className="members__photo">
        {member.photo ? (
          <img src={member.photo} alt={member.name} className="members__image" loading="lazy" />
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
    </div>
  );
}

export default MemberCard;
