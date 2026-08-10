"""
CineBook Analytics
==================
Connects to the same Supabase Postgres database used by the web app and
turns the SQL views defined in sql/schema.sql (revenue_by_day,
occupancy_by_show, top_movies_by_revenue, popular_theatres) into a single
interactive HTML report using pandas + plotly.

USAGE
-----
1. Install dependencies:
     pip install -r requirements.txt

2. Create a .env file in this folder (or the project root) with:
     SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

   You'll find this connection string under Supabase dashboard ->
   Project Settings -> Database -> Connection string (URI).

3. Run it:
     python analytics.py

   This produces `cinebook_report.html` in this folder — open it in any
   browser. It's fully interactive (hover, zoom, filter) because plotly
   charts are self-contained JS, no server required.

WHY A SEPARATE PYTHON MODULE?
------------------------------
The React admin dashboard shows live KPIs for day-to-day operations.
This script is for periodic/offline business reporting — the kind of
multi-page deck a theatre chain's operations or finance team would want
weekly: revenue trends, occupancy health, and which movies/theatres are
carrying the business. Keeping it separate from the web app means it can
be scheduled (cron, GitHub Actions, Airflow) without touching frontend code.
"""

import os
import sys
from datetime import datetime

import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("SUPABASE_DB_URL")


# ---------------------------------------------------------------------------
# Data access
# ---------------------------------------------------------------------------
def get_engine():
    """Create a SQLAlchemy engine for the Supabase Postgres instance.

    Falls back to raising a clear error (rather than a cryptic connection
    failure) if SUPABASE_DB_URL isn't set, since that's the #1 setup mistake.
    """
    if not DB_URL:
        sys.exit(
            "ERROR: SUPABASE_DB_URL is not set.\n"
            "Create a .env file with:\n"
            "  SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres\n"
        )
    return create_engine(DB_URL)


def load_data(engine):
    """Pull each analytics view into its own pandas DataFrame.

    Each of these maps 1:1 to a `view` created in sql/schema.sql — the SQL
    layer does the heavy aggregation, pandas just shapes it for charting.
    """
    revenue_by_day = pd.read_sql("select * from revenue_by_day", engine)
    occupancy_by_show = pd.read_sql("select * from occupancy_by_show", engine)
    top_movies = pd.read_sql("select * from top_movies_by_revenue", engine)
    popular_theatres = pd.read_sql("select * from popular_theatres", engine)
    return revenue_by_day, occupancy_by_show, top_movies, popular_theatres


# ---------------------------------------------------------------------------
# Demo data (used when no database is configured, so this script is always
# runnable end-to-end for evaluation / local testing)
# ---------------------------------------------------------------------------
def demo_data():
    revenue_by_day = pd.DataFrame(
        {
            "day": pd.date_range("2026-07-30", periods=9, freq="D"),
            "revenue": [42000, 38500, 51200, 47800, 68900, 92300, 84100, 51500, 60200],
            "bookings": [95, 88, 110, 101, 145, 190, 175, 108, 128],
        }
    )
    occupancy_by_show = pd.DataFrame(
        {
            "movie_title": ["Nebula Protocol", "Paper Cranes", "Ironclad Redemption", "Midnight Circuit", "Season of Kites"] * 3,
            "theatre_name": (["CineBook Grand"] * 5 + ["CineBook IMAX"] * 5 + ["CineBook Lite"] * 5),
            "occupancy_pct": [82, 65, 91, 58, 74, 88, 70, 95, 61, 79, 55, 60, 68, 45, 63],
        }
    )
    top_movies = pd.DataFrame(
        {
            "title": ["Nebula Protocol", "Ironclad Redemption", "Paper Cranes", "Season of Kites", "Midnight Circuit"],
            "revenue": [184200, 156800, 121400, 98600, 76200],
            "bookings": [612, 498, 402, 340, 265],
        }
    )
    popular_theatres = pd.DataFrame(
        {
            "name": ["CineBook Grand", "CineBook IMAX", "CineBook Lite"],
            "total_bookings": [1240, 980, 640],
            "total_revenue": [312000, 298500, 152000],
        }
    )
    return revenue_by_day, occupancy_by_show, top_movies, popular_theatres


# ---------------------------------------------------------------------------
# Chart builders
# ---------------------------------------------------------------------------
DARK_TEMPLATE = "plotly_dark"
ACCENT = "#e4335a"
GOLD = "#f2b705"
VIOLET = "#7c5cff"


def chart_revenue_trend(df: pd.DataFrame) -> go.Figure:
    fig = px.area(
        df, x="day", y="revenue", title="Daily Revenue Trend",
        template=DARK_TEMPLATE, color_discrete_sequence=[ACCENT],
    )
    fig.update_traces(line=dict(width=3))
    fig.update_layout(paper_bgcolor="#0d0d12", plot_bgcolor="#0d0d12", font=dict(family="Inter, sans-serif"))
    return fig


def chart_top_movies(df: pd.DataFrame) -> go.Figure:
    fig = px.bar(
        df.sort_values("revenue"), x="revenue", y="title", orientation="h",
        title="Top Movies by Revenue", template=DARK_TEMPLATE,
        color_discrete_sequence=[GOLD], text="revenue",
    )
    fig.update_traces(texttemplate="₹%{text:,.0f}", textposition="outside")
    fig.update_layout(paper_bgcolor="#0d0d12", plot_bgcolor="#0d0d12", font=dict(family="Inter, sans-serif"))
    return fig


def chart_occupancy(df: pd.DataFrame) -> go.Figure:
    fig = px.box(
        df, x="theatre_name", y="occupancy_pct", color="theatre_name",
        title="Occupancy Distribution by Theatre", template=DARK_TEMPLATE,
        color_discrete_sequence=[ACCENT, GOLD, VIOLET],
    )
    fig.update_layout(showlegend=False, paper_bgcolor="#0d0d12", plot_bgcolor="#0d0d12", font=dict(family="Inter, sans-serif"))
    return fig


def chart_popular_theatres(df: pd.DataFrame) -> go.Figure:
    fig = px.pie(
        df, names="name", values="total_bookings", title="Booking Share by Theatre",
        template=DARK_TEMPLATE, color_discrete_sequence=[ACCENT, GOLD, VIOLET], hole=0.5,
    )
    fig.update_layout(paper_bgcolor="#0d0d12", font=dict(family="Inter, sans-serif"))
    return fig


# ---------------------------------------------------------------------------
# Report assembly
# ---------------------------------------------------------------------------
def build_report(revenue_by_day, occupancy_by_show, top_movies, popular_theatres, out_path="cinebook_report.html"):
    figs = [
        chart_revenue_trend(revenue_by_day),
        chart_top_movies(top_movies),
        chart_occupancy(occupancy_by_show),
        chart_popular_theatres(popular_theatres),
    ]

    total_revenue = revenue_by_day["revenue"].sum()
    total_bookings = revenue_by_day["bookings"].sum() if "bookings" in revenue_by_day else 0
    avg_occupancy = occupancy_by_show["occupancy_pct"].mean()

    html_parts = [f"""
    <html>
    <head>
      <meta charset="utf-8" />
      <title>CineBook — Business Report</title>
      <style>
        body {{ background:#08080c; color:#f2f2f5; font-family: Inter, sans-serif; margin:0; padding:40px; }}
        h1 {{ font-size:28px; margin-bottom:4px; }}
        .sub {{ color:#9a9aad; margin-bottom:32px; }}
        .kpis {{ display:flex; gap:20px; margin-bottom:40px; flex-wrap:wrap; }}
        .kpi {{ background:#121218; border:1px solid #232330; border-radius:16px; padding:20px 28px; min-width:180px; }}
        .kpi .label {{ font-size:12px; color:#9a9aad; text-transform:uppercase; letter-spacing:0.08em; }}
        .kpi .value {{ font-size:26px; font-weight:700; color:#f2b705; margin-top:6px; }}
        .chart {{ background:#121218; border:1px solid #232330; border-radius:16px; padding:10px; margin-bottom:28px; }}
      </style>
    </head>
    <body>
      <h1>CineBook Business Report</h1>
      <p class="sub">Generated {datetime.now().strftime('%d %b %Y, %H:%M')}</p>
      <div class="kpis">
        <div class="kpi"><div class="label">Total Revenue</div><div class="value">₹{total_revenue:,.0f}</div></div>
        <div class="kpi"><div class="label">Total Bookings</div><div class="value">{total_bookings:,.0f}</div></div>
        <div class="kpi"><div class="label">Avg Occupancy</div><div class="value">{avg_occupancy:.1f}%</div></div>
      </div>
    """]

    for fig in figs:
        html_parts.append(f'<div class="chart">{fig.to_html(include_plotlyjs="cdn", full_html=False)}</div>')

    html_parts.append("</body></html>")

    with open(out_path, "w") as f:
        f.write("\n".join(html_parts))

    print(f"Report written to {os.path.abspath(out_path)}")
    print(f"  Total revenue:   ₹{total_revenue:,.0f}")
    print(f"  Total bookings:  {total_bookings:,.0f}")
    print(f"  Avg occupancy:   {avg_occupancy:.1f}%")


def main():
    if DB_URL:
        engine = get_engine()
        revenue_by_day, occupancy_by_show, top_movies, popular_theatres = load_data(engine)
    else:
        print("SUPABASE_DB_URL not set — generating report from demo data.\n"
              "Set SUPABASE_DB_URL in .env to report on your real database.\n")
        revenue_by_day, occupancy_by_show, top_movies, popular_theatres = demo_data()

    build_report(revenue_by_day, occupancy_by_show, top_movies, popular_theatres)


if __name__ == "__main__":
    main()
