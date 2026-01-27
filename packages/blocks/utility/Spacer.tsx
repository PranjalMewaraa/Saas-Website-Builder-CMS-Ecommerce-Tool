"use client";

export type SpacerProps = {
  height?: number;
};

export const SpacerDefaults: SpacerProps = {
  height: 40,
};

export function Spacer({ height = 40 }: SpacerProps) {
  return <div style={{ height }} />;
}
