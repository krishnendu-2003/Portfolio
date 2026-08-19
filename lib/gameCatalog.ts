// Score-formatting metadata for each game, kept separate from the (code-
// split, dynamically-imported) game components themselves so the High
// Scores window can format a score without ever loading a game's canvas
// code just to read its title/units.
export type GameCatalogEntry = {
  title: string;
  higherIsBetter: boolean;
  formatScore: (value: number) => string;
};

export const GAME_CATALOG: Record<string, GameCatalogEntry> = {};
