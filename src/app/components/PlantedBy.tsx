/**
 * Footer badge: small sprout at rest, tiny walk GIF on hover (chester.how scale).
 */
export function PlantedBy() {
  return (
    <div className="planted-by" tabIndex={0}>
      <div className="planted-by__stage" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/planted/boy-walk.gif"
          alt=""
          width={72}
          height={96}
          className="planted-by__gif"
          draggable={false}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/planted/leaves.svg"
          alt=""
          width={28}
          height={28}
          className="planted-by__leaves"
          draggable={false}
        />
      </div>
      <span className="planted-by__label">Planted by KP</span>
    </div>
  );
}