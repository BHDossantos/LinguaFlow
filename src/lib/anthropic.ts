import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Current, most-capable general model. Used by the coach, translate, roleplay,
// grade, and generate routes. Update here to move every AI feature at once.
export const MODEL = "claude-sonnet-5";
