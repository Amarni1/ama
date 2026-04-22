import express from "express";
import { messageSchema } from "../services/intentParser.js";
import { handleChatMessage } from "../services/aiEngine.js";

const router = express.Router();

router.post("/", (request, response) => {
  const parsed = messageSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      message: "Invalid chat payload.",
      issues: parsed.error.flatten()
    });
  }

  const result = handleChatMessage(parsed.data.message);
  return response.json(result);
});

export default router;
