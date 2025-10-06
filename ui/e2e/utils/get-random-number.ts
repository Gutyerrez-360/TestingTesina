export function getRandomNumber(limit: number): number {
  return Math.floor(Math.random() * Math.min(limit));
}
