import type { Game } from "./types";
import gamesData from "../data/games.json";

/**
 * ---------------------------------------------------------------------------
 * YOUR GAMES LIVE IN  src/data/games.json  — EDIT THAT FILE DIRECTLY
 * ---------------------------------------------------------------------------
 * You already have your own game sources hosted on your own server/CDN.
 * For every game, add one entry to src/data/games.json with:
 *   - "id"    -> any unique string/number you choose (used in the URL /game/<id>)
 *   - "url"   -> the iframe URL where YOUR hosted game actually lives
 *   - "thumb" -> your thumbnail image URL
 *   - "previewVideo" (optional) -> short muted looping preview clip URL
 *   - title, category, tags, description, width, height, etc.
 *
 * There is NO live network fetch here — the whole site is generated at
 * build time straight from this file. That's better for you: no external
 * API dependency, no rate limits, and it's exactly what keeps Lighthouse/
 * Core Web Vitals scores high (pure static HTML, nothing to wait on).
 *
 * If you ever DO want to pull data from a remote endpoint instead of this
 * file (e.g. a CMS or your own backend API), replace the body of
 * `loadGames()` below with a `fetch()` call — everything else in the app
 * (pages/components) stays exactly the same because they only ever import
 * from this file.
 * ---------------------------------------------------------------------------
 */

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Normalizes one raw entry from games.json into our strict Game type.
// Kept flexible about field names in case you paste in data exported from
// somewhere else (e.g. "name" instead of "title", "image" instead of "thumb").
function normalizeGame(raw: Record<string, any>): Game {
  const title = raw.title ?? raw.name ?? "Untitled Game";
  return {
    id: String(raw.id ?? raw.game_id ?? slugify(title)),
    title,
    slug: slugify(title),
    description: raw.description ?? "",
    instructions: raw.instructions ?? raw.instruction ?? undefined,
    category: raw.category ?? "More Games",
    tags: Array.isArray(raw.tags)
      ? raw.tags
      : typeof raw.tags === "string"
        ? raw.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    width: Number(raw.width ?? 960),
    height: Number(raw.height ?? 540),
    // This is YOUR game's iframe URL, hosted on your own external site.
    playUrl: raw.url ?? raw.iframe_url ?? raw.embed ?? "",
    thumbnail: raw.thumb ?? raw.thumbnail ?? raw.image ?? "",
    previewVideo: raw.previewVideo ?? raw.preview_video ?? raw.video ?? undefined,
    plays: raw.plays ? Number(raw.plays) : undefined,
    rating: raw.rating ? Number(raw.rating) : undefined,
    featured: Boolean(raw.featured),
  };
}

function loadGames(): Game[] {
  return (gamesData as any[]).map(normalizeGame);
}

let cache: Game[] | null = null;

export async function getAllGames(): Promise<Game[]> {
  if (!cache) cache = loadGames();
  return cache;
}

/** Fetch a single game strictly by its id (used by /game/[id].astro). */
export async function getGameById(id: string): Promise<Game | undefined> {
  const games = await getAllGames();
  return games.find((g) => g.id === id);
}

export async function getGamesByCategory(category: string): Promise<Game[]> {
  const games = await getAllGames();
  return games.filter((g) => g.category.toLowerCase() === category.toLowerCase());
}

export async function getFeaturedGames(limit = 8): Promise<Game[]> {
  const games = await getAllGames();
  const featured = games.filter((g) => g.featured);
  return (featured.length ? featured : games).slice(0, limit);
}

export async function getAllCategories(): Promise<string[]> {
  const games = await getAllGames();
  return [...new Set(games.map((g) => g.category))].sort();
}

/** "More games" rail on a game's own page — same category first, then rest. */
export async function getRelatedGames(currentId: string, category: string, limit = 12): Promise<Game[]> {
  const games = await getAllGames();
  const sameCategory = games.filter((g) => g.id !== currentId && g.category === category);
  const others = games.filter((g) => g.id !== currentId && g.category !== category);
  return [...sameCategory, ...others].slice(0, limit);
}
