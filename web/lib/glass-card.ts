/** Hercules dark glass panel — shared across inner pages */
export const GLASS_CARD =
  "bg-[rgba(28,28,28,0.72)] backdrop-blur-xl border border-white/16 shadow-[0_24px_64px_rgba(0,0,0,0.45)] rounded-sm transition-all duration-[450ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1 hover:border-white/28 hover:shadow-[0_32px_72px_rgba(0,0,0,0.55)]";

/** Ivory glass panel for memorial profile (readable on #fcfbf7 canvas) */
export const MEMORIAL_IVORY_CARD =
  "bg-[rgba(255,255,255,0.58)] backdrop-blur-md border border-[#D4AF37]/28 shadow-[0_8px_32px_rgba(30,40,30,0.06)] rounded-lg";

/** Editorial memorial card — cream canvas, generous desktop padding */
export const MEMORIAL_EDITORIAL_CARD =
  "rounded-xl border border-[#D4AF37]/20 bg-white/40 p-5 shadow-[0_8px_40px_rgba(61,52,40,0.07)] backdrop-blur-md transition-shadow duration-300 sm:p-6 lg:p-8 lg:shadow-[0_16px_56px_rgba(61,52,40,0.09)]";

/** Premium tactile pill for memorial actions (candle, mass sheets) */
export const MEMORIAL_PILL_BTN =
  "rounded-full transition-all duration-300 ease-in-out hover:shadow-[0_4px_20px_rgba(61,52,40,0.15)] active:scale-[0.98]";

/** Home action trigger pills (mass / candle on landing) */
export const HOME_ACTION_PILL =
  `${MEMORIAL_PILL_BTN} w-full border border-white/20 bg-white/8 px-6 py-4 text-base font-bold text-white backdrop-blur-sm hover:border-white/40 hover:bg-white/14`;
