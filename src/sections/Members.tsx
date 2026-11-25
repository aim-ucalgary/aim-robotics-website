import { useEffect, useState } from "react";
import MemberCard from "../components/MemberCard";
import SectionLabel from "../components/SectionLabel";
import TechnicalLabel from "../components/TechnicalLabel";
import { members } from "../content/loader";
import { loadPublicMembers } from "../content/publicMembers";
import type { PublicMember } from "../content/types";
import "./Members.css";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; people: PublicMember[] }
  | { kind: "error" };

/** 06 / Teams — Members: published profiles from the database, grouped by subteam. */
function Members() {
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    loadPublicMembers()
      .then((people) => active && setState({ kind: "ready", people }))
      .catch(() => active && setState({ kind: "error" }));
    return () => {
      active = false;
    };
  }, []);

  const groups =
    state.kind === "ready"
      ? members.groups
          .map((group) => ({ ...group, people: state.people.filter((person) => person.subteam === group.id) }))
          .filter((group) => group.people.length > 0)
      : [];

  return (
    <section
      id="members"
      className="members"
      aria-labelledby="members-heading"
      aria-busy={state.kind === "loading"}
    >
      <div className="container">
        <SectionLabel>{members.sectionLabel}</SectionLabel>
        <h2 id="members-heading" className="members__heading">
          {members.heading}
        </h2>
        <p className="members__intro">{members.intro}</p>

        {state.kind === "loading" && (
          <p className="members__status" role="status">
            {members.loadingText}
          </p>
        )}
        {state.kind === "error" && <p className="members__status">{members.errorText}</p>}
        {state.kind === "ready" && groups.length === 0 && (
          <p className="members__status">{members.emptyText}</p>
        )}

        {groups.map((group) => (
          <div key={group.id} className="members__group">
            <div className="members__group-header">
              <TechnicalLabel accent>{group.tag}</TechnicalLabel>
              <h3 id={`members-${group.id}`} className="members__group-title">
                {group.title}
              </h3>
            </div>

            <ul className="members__grid" aria-labelledby={`members-${group.id}`}>
              {group.people.map((person) => (
                <li key={person.id}>
                  <MemberCard
                    member={{
                      name: person.name,
                      role: person.role,
                      program: person.program || undefined,
                      photo: person.photo || undefined,
                      linkedin: person.linkedin || undefined,
                    }}
                  />
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
