import QRCode from "react-qr-code";

export function QRGenerator({ value, size = 256 }: { value: string, size?: number }) {
  return (
    <div style={{ height: "auto", margin: "0 auto", maxWidth: size, width: "100%" }}>
      <QRCode
        size={size}
        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        value={value}
        viewBox={`0 0 ${size} ${size}`}
      />
    </div>
  );
}
