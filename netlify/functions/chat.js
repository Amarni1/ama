import { handleChatMessage } from "../../server/services/aiEngine.js";
import { messageSchema } from "../../server/services/intentParser.js";

export default async (request) => {
  try {
    const body = await request.json();
    const parsed = messageSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          message: "Invalid chat payload.",
          issues: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    return Response.json(handleChatMessage(parsed.data.message));
  } catch (_error) {
    return Response.json(
      {
        message: "Unable to process this request."
      },
      { status: 500 }
    );
  }
};

export const config = {
  path: "/api/chat"
};
