import { useEffect, useId, useState } from "react";
import "./FieldMotif.css";

interface FieldMotifProps {
  className?: string;
  variant?: "field" | "crosshair";
}

/** The pass: from the passer (bottom left), through a receiver, to the goal end. */
const PASS_PATH = "M40 240 C 120 210, 160 120, 240 100 S 340 70, 366 60";

/** How far along the pass (0 = start, 1 = end) the receiving robot stands. */
const RECEIVE_AT = 0.38;

/** One loop of the play, in seconds. */
const LOOP = "6s";

/** True when the visitor has asked their system for reduced motion. */
function usePrefersReducedMotion() {
  const query = "(prefers-reduced-motion: reduce)";
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setReduced(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/**
 * Decorative SVG: simplified RoboCup SSL field geometry. In the "field" variant
 * a ball travels along the dashed pass line: it leaves the passer, pauses at
 * the receiving robot, then carries on to the goal end and loops. With reduced
 * motion turned on, the dots are drawn in fixed positions instead.
 */
function FieldMotif({ className, variant = "field" }: FieldMotifProps) {
  // useId() can contain ":" or "«»", which break "#id" references; keep it plain.
  const pathId = `field-pass-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const reducedMotion = usePrefersReducedMotion();
  const followPass = <mpath href={`#${pathId}`} />;

  return (
    <svg
      className={className}
      viewBox="0 0 400 300"
      role="presentation"
      aria-hidden="true"
    >
      <rect x="8" y="8" width="384" height="284" fill="none" stroke="var(--on-white)" strokeWidth="1.5" />
      <line x1="200" y1="8" x2="200" y2="292" stroke="var(--on-white)" strokeWidth="1.5" />
      <circle cx="200" cy="150" r="46" fill="none" stroke="var(--aim-red)" strokeWidth="1.5" />
      <circle cx="200" cy="150" r="2.5" fill="var(--charcoal)" />

      <rect x="8" y="90" width="56" height="120" fill="none" stroke="var(--on-white)" strokeWidth="1.5" />
      <rect x="336" y="90" width="56" height="120" fill="none" stroke="var(--on-white)" strokeWidth="1.5" />

      {variant === "field" ? (
        <>
          <path
            id={pathId}
            className="field-motif__pass"
            d={PASS_PATH}
            fill="none"
            stroke="var(--aim-gold)"
            strokeWidth="1.5"
            strokeDasharray="5 6"
          />

          {/* Target at the goal end stays fixed. */}
          <circle cx="366" cy="60" r="3" fill="var(--aim-gold)" />

          {reducedMotion ? (
            <>
              <circle cx="40" cy="240" r="5" fill="var(--charcoal)" />
              <circle cx="150" cy="150" r="5" fill="var(--charcoal)" />
              <circle cx="260" cy="95" r="5" fill="var(--aim-gold)" />
            </>
          ) : (
            <>
              {/* Passer: steps forward through the pass, then resets. */}
              <circle r="5" fill="var(--charcoal)">
                <animateMotion
                  dur={LOOP}
                  repeatCount="indefinite"
                  calcMode="linear"
                  keyPoints="0;0;0.05;0"
                  keyTimes="0;0.1;0.5;1"
                >
                  {followPass}
                </animateMotion>
              </circle>

              {/* Receiver: moves into position to meet the ball, then drifts back. */}
              <circle r="5" fill="var(--charcoal)">
                <animateMotion
                  dur={LOOP}
                  repeatCount="indefinite"
                  calcMode="linear"
                  keyPoints={`${RECEIVE_AT - 0.05};${RECEIVE_AT};${RECEIVE_AT};${RECEIVE_AT - 0.05}`}
                  keyTimes="0;0.3;0.5;1"
                >
                  {followPass}
                </animateMotion>
              </circle>

              {/* Ball: runs to the receiver, pauses, carries on to the goal end,
                  then fades out so the jump back to the start isn't seen. */}
              <circle r="5" fill="var(--aim-gold)">
                <animateMotion
                  dur={LOOP}
                  repeatCount="indefinite"
                  calcMode="linear"
                  keyPoints={`0;${RECEIVE_AT};${RECEIVE_AT};1;1`}
                  keyTimes="0;0.3;0.45;0.85;1"
                >
                  {followPass}
                </animateMotion>
                <animate
                  attributeName="opacity"
                  dur={LOOP}
                  repeatCount="indefinite"
                  values="1;1;0;0"
                  keyTimes="0;0.88;0.95;1"
                />
              </circle>
            </>
          )}
        </>
      ) : (
        <g stroke="var(--charcoal)" strokeWidth="1.5" fill="none">
          <line x1="200" y1="60" x2="200" y2="90" />
          <line x1="200" y1="210" x2="200" y2="240" />
          <line x1="120" y1="150" x2="150" y2="150" />
          <line x1="250" y1="150" x2="280" y2="150" />
        </g>
      )}
    </svg>
  );
}

export default FieldMotif;
