import type { PlateTierId } from "@/lib/qr-plates";

type Props = {
  variant: PlateTierId;
  qrSrc?: string;
  label?: string;
};

export function QrPlateVisual({ variant, qrSrc, label = "Skenuokite atmintį" }: Props) {
  return (
    <div className={`ae-plate-mock ae-plate-mock--${variant}`}>
      <div className="ae-plate-mock__body">
        <div className="ae-plate-mock__rim" />
        <div className="ae-plate-mock__qr-wrap">
          {qrSrc ? (
            <img src={qrSrc} alt="" className="ae-plate-mock__qr" width={72} height={72} />
          ) : (
            <div className="ae-plate-mock__qr-placeholder" aria-hidden />
          )}
        </div>
        <span className="ae-plate-mock__caption">{label}</span>
        {variant === "prestige" && <span className="ae-plate-mock__ornament" aria-hidden>✝</span>}
      </div>
      <div className="ae-plate-mock__shadow" aria-hidden />
    </div>
  );
}
