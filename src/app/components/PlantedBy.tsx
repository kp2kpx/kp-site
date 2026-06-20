/**
 * Footer badge: small sprout at rest, tiny walk GIF on hover (chester.how scale).
 */
export function PlantedBy() {
  return (
    <div className="planted-by">
      <div className="planted-by__stage" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/planted/boy-walk.gif"
          alt=""
          width={54}
          height={72}
          className="planted-by__gif"
          draggable={false}
        />
      </div>
      <button
        type="button"
        className="planted-by__leaf-hit"
        aria-label="Show planted-by animation"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/planted/leaves.svg"
          alt=""
          width={21}
          height={21}
          className="planted-by__leaves"
          draggable={false}
        />
      </button>
      <span className="planted-by__label">Planted by KP</span>
    </div>
  );
}