/** Hercules glassmorphism card — shared across landing layout cards */
export const GLASS_CARD =
  "bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(212,175,55,0.05)] rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_0_rgba(212,175,55,0.1)]";

/** Premium tactile pill for memorial actions (candle, mass sheets) */
export const MEMORIAL_PILL_BTN =
  "rounded-full transition-all duration-300 ease-in-out hover:shadow-[0_0_24px_rgba(245,158,11,0.35)] active:scale-[0.98]";

/** Home action trigger pills (mass / candle on landing) */
export const HOME_ACTION_PILL =
  `${MEMORIAL_PILL_BTN} w-full border-2 border-[#0F2519]/20 bg-white/50 px-6 py-4 text-base font-bold text-[#0A1A10] backdrop-blur-sm hover:border-[#D4AF37]/50 hover:bg-[#0F2519] hover:text-white`;
