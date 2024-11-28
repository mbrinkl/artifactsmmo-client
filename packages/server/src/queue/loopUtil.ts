import { Character, Destination, Encyclopedia } from "@artifacts/shared";
import { QueueItem } from "./queue";

export const getInventoryNumItems = ({ inventory }: Character): number => {
  return inventory.reduce((a, b) => a + b.quantity, 0);
};

export const getClosest = (squareCode: string, { x, y }: Character, encyclopedia: Encyclopedia): Destination => {
  const squares = encyclopedia.squares.filter((x) => x.content?.code === squareCode);

  if (squares.length === 0) {
    throw new Error("Invalid code: " + squareCode);
  }

  return squares.reduce((closest, current) => {
    const distanceToClosest = Math.sqrt(Math.pow(x - closest.x, 2) + Math.pow(y - closest.y, 2));
    const distanceToCurrent = Math.sqrt(Math.pow(x - current.x, 2) + Math.pow(y - current.y, 2));
    return distanceToCurrent < distanceToClosest ? current : closest;
  });
};

export const depositAll = ({ inventory }: Character): QueueItem[] => {
  return inventory
    .filter((x) => x.quantity > 0)
    .map(({ code, quantity }) => ({
      action: { type: "deposit", payload: { code, quantity } },
    }));
};