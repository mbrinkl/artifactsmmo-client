import { characterContext } from "..";
import { getCharacter } from "../api";
import { delayUntil, runQueue } from "../queue";
import { CharacterContext } from "../types";
import { craftLoop } from "./craftLoop";
import { gatherLoop } from "./gatherLoop";

export const loopFactory = async (ctx: CharacterContext) => {
  if (!ctx.activity) return;

  const initialCharacterState = await getCharacter(ctx.characterName);

  if (initialCharacterState.cooldown_expiration) {
    console.log(ctx.characterName, "Awaiting existing cooldown:", initialCharacterState.cooldown_expiration);
    await delayUntil(initialCharacterState.cooldown_expiration);
  }

  if (ctx.version !== characterContext[ctx.characterName].version) {
    console.log("version increased");
    return;
  }

  switch (ctx.activity.name) {
    case "gather":
      ctx.queue = gatherLoop({ character: initialCharacterState }, ctx.activity.context);
      break;
    case "craft":
      ctx.queue = craftLoop({ character: initialCharacterState }, ctx.activity.context);
      break;
  }

  await runQueue(ctx);
};