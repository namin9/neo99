"""Convert Excel data sources into JSON seed files for the NeoQik datastore."""

from __future__ import annotations

import json
from dataclasses import dataclass, asdict
from pathlib import Path

import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
SEED_DIR = BASE_DIR / "seed"

TERMINALS_XLSX = BASE_DIR / "terminals.xlsx"
ROUTES_XLSX = BASE_DIR / "express_schedules_with_coords.xlsx"


@dataclass
class Terminal:
    id: str
    name: str
    city: str | None
    lat: float | None
    lng: float | None


@dataclass
class Route:
    id: str
    origin_id: str
    origin_name: str
    origin_lat: float | None
    origin_lng: float | None
    destination_id: str
    destination_name: str
    destination_lat: float | None
    destination_lng: float | None
    duration_min: int
    distance_km: float
    price_adult: int
    price_child: int
    price_youth: int
    company: str
    grade: str


@dataclass
class Schedule:
    id: str
    route_id: str
    departure_time: str


def load_terminals() -> list[Terminal]:
    if not TERMINALS_XLSX.exists():
        raise FileNotFoundError(f"Missing Excel source: {TERMINALS_XLSX}")
    df = pd.read_excel(TERMINALS_XLSX)
    required_columns = {"id", "name", "city", "lat", "lng"}
    if not required_columns.issubset(df.columns):
        raise ValueError(f"Terminal sheet must contain: {required_columns}")
    terminals: list[Terminal] = []
    for row in df.itertuples():
        terminals.append(
            Terminal(
                id=str(row.id),
                name=str(row.name),
                city=str(row.city) if getattr(row, "city", None) else None,
                lat=float(row.lat) if getattr(row, "lat", None) else None,
                lng=float(row.lng) if getattr(row, "lng", None) else None,
            )
        )
    return terminals


def load_routes_and_schedules() -> tuple[list[Route], list[Schedule]]:
    if not ROUTES_XLSX.exists():
        raise FileNotFoundError(f"Missing Excel source: {ROUTES_XLSX}")
    df = pd.read_excel(ROUTES_XLSX)
    route_columns = {
        "route_id",
        "origin_id",
        "origin_name",
        "origin_lat",
        "origin_lng",
        "destination_id",
        "destination_name",
        "destination_lat",
        "destination_lng",
        "duration_min",
        "distance_km",
        "price_adult",
        "price_child",
        "price_youth",
        "company",
        "grade",
        "schedule_id",
        "departure_time",
    }
    if not route_columns.issubset(df.columns):
        missing = route_columns.difference(df.columns)
        raise ValueError(f"Schedule sheet missing columns: {missing}")

    routes: dict[str, Route] = {}
    schedules: list[Schedule] = []

    for row in df.itertuples():
        route_id = str(row.route_id)
        if route_id not in routes:
            routes[route_id] = Route(
                id=route_id,
                origin_id=str(row.origin_id),
                origin_name=str(row.origin_name),
                origin_lat=float(row.origin_lat) if getattr(row, "origin_lat", None) else None,
                origin_lng=float(row.origin_lng) if getattr(row, "origin_lng", None) else None,
                destination_id=str(row.destination_id),
                destination_name=str(row.destination_name),
                destination_lat=float(row.destination_lat)
                if getattr(row, "destination_lat", None)
                else None,
                destination_lng=float(row.destination_lng)
                if getattr(row, "destination_lng", None)
                else None,
                duration_min=int(row.duration_min),
                distance_km=float(row.distance_km),
                price_adult=int(row.price_adult),
                price_child=int(row.price_child),
                price_youth=int(row.price_youth),
                company=str(row.company),
                grade=str(row.grade),
            )
        schedules.append(
            Schedule(
                id=str(row.schedule_id),
                route_id=route_id,
                departure_time=str(row.departure_time),
            )
        )

    return list(routes.values()), schedules


def write_json(path: Path, data: list[object]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fp:
        json.dump([asdict(item) for item in data], fp, ensure_ascii=False, indent=2)


def main() -> None:
    terminals = load_terminals()
    routes, schedules = load_routes_and_schedules()

    write_json(SEED_DIR / "terminals.json", terminals)
    write_json(SEED_DIR / "routes.json", routes)
    write_json(SEED_DIR / "schedules.json", schedules)

    print("Generated JSON seed files in", SEED_DIR)


if __name__ == "__main__":
    main()
