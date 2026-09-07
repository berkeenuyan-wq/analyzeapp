"""Plotly chart builders, themed from the design-system tokens.

Every plot: transparent paper/plot so the card surface shows through, the
ordered ``--series-*`` palette (series 1 = the primary measure), hairline grid,
subtle axis text, a fixed height, and the card does the framing. First-draw
animation is left to Plotly's default (~short); no counting-up, no bounce.
"""
from __future__ import annotations

import plotly.graph_objects as go

from .theme import palette

_FONT = 'Geist, "Segoe UI", system-ui, -apple-system, sans-serif'
_MONO = 'Geist Mono, "SFMono-Regular", ui-monospace, monospace'


def _layout(pal: dict, height: int, *, legend: bool = False) -> dict:
    return dict(
        height=height,
        margin=dict(l=48, r=12, t=10, b=32),
        paper_bgcolor=pal["paper"],
        plot_bgcolor=pal["paper"],
        font=dict(family=_FONT, size=12, color=pal["text"]),
        xaxis=dict(
            showgrid=False,
            zeroline=False,
            linecolor=pal["grid"],
            tickfont=dict(family=_FONT, size=11, color=pal["axis"]),
            type="category",  # labels are pre-formatted strings, never auto-parsed dates
        ),
        yaxis=dict(
            showgrid=True,
            gridcolor=pal["grid"],
            zeroline=False,
            tickfont=dict(family=_MONO, size=11, color=pal["axis"]),
        ),
        showlegend=legend,
        legend=dict(orientation="h", yanchor="bottom", y=1.02, x=0,
                    font=dict(size=11, color=pal["text"])),
        hoverlabel=dict(font=dict(family=_FONT, size=12), bgcolor=pal["paper"]),
        modebar=dict(remove=["lasso", "select", "autoScale", "zoom", "pan"]),
        dragmode=False,
    )


def line_chart(
    labels: list[str],
    series: list[dict],          # {"name", "values", "series"?: int, "color"?: str}
    *,
    theme: str = "dark",
    height: int = 252,
    fill: bool = True,
    limit: dict | None = None,   # {"value", "label"}
) -> go.Figure:
    pal = palette(theme)
    fig = go.Figure()
    for i, s in enumerate(series):
        color = s.get("color") or pal["series"][s.get("series", i + 1) - 1 % len(pal["series"])]
        fig.add_trace(
            go.Scatter(
                x=labels,
                y=s["values"],
                name=s["name"],
                mode="lines+markers",
                line=dict(color=color, width=2, shape="linear"),
                marker=dict(size=6, color=color, line=dict(width=1.5, color=pal["paper"])),
                fill="tozeroy" if fill else None,
                fillcolor=_alpha(color, 0.10) if fill else None,
                hovertemplate="%{y:.1f}<extra>" + s["name"] + "</extra>",
            )
        )
    if limit:
        fig.add_hline(
            y=limit["value"], line=dict(color=pal["signal"]["bad"], width=1.5, dash="dash"),
            annotation_text=limit.get("label", ""), annotation_position="top right",
            annotation_font=dict(size=11, color=pal["signal"]["bad"]),
        )
    fig.update_layout(**_layout(pal, height, legend=len(series) > 1))
    return fig


def bar_chart(
    labels: list[str],
    groups: list[dict],          # {"name", "values", "series"?: int, "color"?: str}
    *,
    theme: str = "dark",
    height: int = 252,
    limit: dict | None = None,
    barmode: str = "group",
) -> go.Figure:
    pal = palette(theme)
    fig = go.Figure()
    for i, g in enumerate(groups):
        color = g.get("color") or pal["series"][(g.get("series", i + 1) - 1) % len(pal["series"])]
        fig.add_trace(
            go.Bar(
                x=labels, y=g["values"], name=g["name"], marker_color=color,
                marker_line_width=0,
                hovertemplate="%{y:.1f}<extra>" + g["name"] + "</extra>",
            )
        )
    if limit:
        fig.add_hline(
            y=limit["value"], line=dict(color=pal["signal"]["bad"], width=1.5, dash="dash"),
            annotation_text=limit.get("label", ""), annotation_position="top right",
            annotation_font=dict(size=11, color=pal["signal"]["bad"]),
        )
    fig.update_layout(**_layout(pal, height, legend=len(groups) > 1), barmode=barmode, bargap=0.38,
                      bargroupgap=0.12)
    return fig


def dual_area(
    labels: list[str],
    series: list[dict],          # {"name","values","series"?:int,"color"?:str,"axis"?:"left"|"right","unit"?:str}
    *,
    theme: str = "dark",
    height: int = 252,
) -> go.Figure:
    """Smooth filled-area line chart; series can sit on a left or right y-axis.

    Reads like the reference "trend" cards: spline lines, soft gradient fill,
    one shared vertical crosshair, unified hover.
    """
    pal = palette(theme)
    fig = go.Figure()
    for i, s in enumerate(series):
        color = s.get("color") or pal["series"][(s.get("series", i + 1) - 1) % len(pal["series"])]
        right = s.get("axis") == "right"
        unit = (" " + s["unit"]) if s.get("unit") else ""
        fig.add_trace(
            go.Scatter(
                x=labels, y=s["values"], name=s["name"],
                mode="lines",
                line=dict(color=color, width=2.4, shape="spline", smoothing=0.6),
                fill="tozeroy",
                fillcolor=_alpha(color, 0.16 if not right else 0.10),
                yaxis="y2" if right else "y",
                hovertemplate="%{y:.1f}" + unit + "<extra>" + s["name"] + "</extra>",
            )
        )
    lay = _layout(pal, height, legend=False)
    lay["hovermode"] = "x unified"
    lay["margin"] = dict(l=48, r=48, t=10, b=42)
    lay["xaxis"].update(
        showspikes=True, spikemode="across", spikesnap="cursor",
        spikecolor=pal["crosshair"], spikethickness=1, spikedash="solid",
        tickangle=-35,
    )
    lay["yaxis"].update(rangemode="tozero")
    has_right = any(s.get("axis") == "right" for s in series)
    if has_right:
        lay["yaxis2"] = dict(
            overlaying="y", side="right", showgrid=False, zeroline=False,
            rangemode="tozero",
            tickfont=dict(family=_MONO, size=11, color=pal["axis"]),
        )
    fig.update_layout(**lay)
    return fig


def donut(
    slices: list[dict],          # {"name", "value", "color"?: str}
    *,
    theme: str = "dark",
    height: int = 236,
    center_value: str = "",
    center_label: str = "",
) -> go.Figure:
    pal = palette(theme)
    colors = [s.get("color") or pal["series"][i % len(pal["series"])] for i, s in enumerate(slices)]
    fig = go.Figure(
        go.Pie(
            labels=[s["name"] for s in slices],
            values=[s["value"] for s in slices],
            hole=0.68,
            marker=dict(colors=colors, line=dict(color=pal["paper"], width=2)),
            textinfo="none",
            hovertemplate="%{label}: %{value:.0f} (%{percent})<extra></extra>",
            sort=False,
            direction="clockwise",
        )
    )
    fig.update_layout(
        height=height,
        margin=dict(l=8, r=8, t=8, b=8),
        paper_bgcolor=pal["paper"],
        plot_bgcolor=pal["paper"],
        showlegend=False,
        font=dict(family=_FONT, size=12, color=pal["text"]),
        annotations=[
            dict(text=center_value, x=0.5, y=0.54, font=dict(size=24, color=pal["text"], family=_FONT), showarrow=False),
            dict(text=center_label, x=0.5, y=0.40, font=dict(size=11, color=pal["axis"], family=_FONT), showarrow=False),
        ],
    )
    return fig


PLOTLY_CONFIG = {"displayModeBar": False, "responsive": True, "staticPlot": False}


def _alpha(hex_color: str, a: float) -> str:
    h = hex_color.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return f"rgba({r},{g},{b},{a})"
