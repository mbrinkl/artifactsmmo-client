import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import createClient from "openapi-fetch";
import { Activity, ActivityName, paths } from "@artifacts/shared";
import { getCharacters } from "./api";
import { hooks, routes } from "./routes";
import { CharacterContext } from "./types";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { drizzle } from "drizzle-orm/libsql";
import { characterActivityTable } from "./db/schema";
import { scenarioFactory } from "./scenarios";

export const db = drizzle("file:local.db");

const authToken = process.env.auth_token;
if (!authToken) {
  throw new Error("Auth token not set in environment variables");
}

export const client = createClient<paths>({
  baseUrl: "https://api.artifactsmmo.com",
  headers: {
    Authorization: "Bearer " + authToken,
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  redirect: "follow",
});

const characters = await getCharacters();
if (!characters) {
  throw new Error("No characters found");
}
const characterNames = characters.map((x) => x.name);

export const characterContext: Record<string, CharacterContext> = {};

const storedCharacterActivities = await db.select().from(characterActivityTable);

characterNames.forEach((characterName) => {
  const stored = storedCharacterActivities.find((x) => x.name === characterName);
  if (stored) {
    console.log(characterName, "Restored Activity - ", stored.activityName, stored.activityContext);
    const storedContext = stored.activityContext ? JSON.parse(stored.activityContext) : null;
    const storedActivity: Activity = { name: stored.activityName as ActivityName, context: storedContext };
    characterContext[characterName] = { characterName, activity: storedActivity, queue: [] };
    scenarioFactory(characterContext[characterName]);
  } else {
    characterContext[characterName] = { characterName, activity: null, queue: [] };
  }
});

const fastify = Fastify();

if (process.env.NODE_ENV === "development") {
  await fastify.register(fastifyCors);
} else {
  await fastify.register(fastifyStatic, {
    root: path.join(dirname(fileURLToPath(import.meta.url)), "../../client/dist"),
  });
  fastify.get("/", (req, res) => {
    res.sendFile("index.html");
  });
}

await fastify.register(hooks);
await fastify.register(routes);

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
