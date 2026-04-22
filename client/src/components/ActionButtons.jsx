export default function ActionButtons({ onBalance, onAddress }) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={onBalance}
        className="rounded-full border border-black bg-black px-5 py-3 text-sm font-medium text-ma-gold shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5"
      >
        Check Balance
      </button>
      <button
        onClick={onAddress}
        className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-ma-black transition hover:border-ma-gold hover:text-ma-gold"
      >
        Show Address
      </button>
    </div>
  );
}
