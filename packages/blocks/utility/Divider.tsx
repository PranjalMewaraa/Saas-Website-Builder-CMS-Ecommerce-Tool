"use client";

export type DividerProps = {
  thickness?: number;
  color?: string;
  marginY?: number;
};

export const DividerDefaults: DividerProps = {
  thickness: 1,
  color: "#e5e7eb",
  marginY: 24,
};

export function Divider({
  thickness = 1,
  color = "#e5e7eb",
  marginY = 24,
}: DividerProps) {
  return (
    <hr
      style={{
        border: "none",
        borderTop: `${thickness}px solid ${color}`,
        margin: `${marginY}px 0`,
      }}
    />
  );
}
