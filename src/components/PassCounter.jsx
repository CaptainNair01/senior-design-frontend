export default function PassCounter({
  label,
  description,
  price,
  quantity,
  onDecrease,
  onIncrease,
  disabled = false,
}) {
  return (
    <article className={`counter-card ${disabled ? "is-disabled" : ""}`}>
      <div>
        <p className="counter-label">{label}</p>
        <p className="counter-description">{description}</p>
      </div>

      {disabled ? (
        <span className="tag tag--muted">Coming soon</span>
      ) : (
        <>
          <strong className="counter-price">${price}</strong>
          <div className="counter-actions">
            <button
              aria-label={`Decrease ${label}`}
              className="counter-button"
              onClick={onDecrease}
              type="button"
            >
              -
            </button>
            <span className="counter-value">{quantity}</span>
            <button
              aria-label={`Increase ${label}`}
              className="counter-button"
              onClick={onIncrease}
              type="button"
            >
              +
            </button>
          </div>
        </>
      )}
    </article>
  );
}
