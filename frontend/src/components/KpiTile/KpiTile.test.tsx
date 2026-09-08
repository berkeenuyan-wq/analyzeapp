import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { KpiTile } from "./KpiTile";

describe("KpiTile", () => {
  it("renders the value and unit when data is present", () => {
    render(
      <KpiTile
        label="Ort. Toplam Verim"
        value="91,05"
        unit="%"
        emptyText="veri yok"
      />,
    );
    expect(screen.getByText("91,05")).toBeInTheDocument();
    expect(screen.getByText("%")).toBeInTheDocument();
    expect(screen.queryByText("veri yok")).not.toBeInTheDocument();
  });

  it("shows the empty text and hides the unit when value is null", () => {
    render(
      <KpiTile
        label="Ort. Toplam Verim"
        value={null}
        unit="%"
        emptyText="veri yok"
      />,
    );
    expect(screen.getByText("veri yok")).toBeInTheDocument();
    expect(screen.queryByText("%")).not.toBeInTheDocument();
  });

  it("shows a tone label only for a non-neutral tone", () => {
    const { rerender } = render(
      <KpiTile label="x" value="1" emptyText="-" tone="neutral" toneLabel="iyi" />,
    );
    expect(screen.queryByText("iyi")).not.toBeInTheDocument();

    rerender(
      <KpiTile label="x" value="1" emptyText="-" tone="good" toneLabel="iyi" />,
    );
    expect(screen.getByText("iyi")).toBeInTheDocument();
  });
});
