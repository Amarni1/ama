import express from "express";

const router = express.Router();

router.get("/", (_request, response) => {
  response.json({
    status: "ready",
    message: "Wallet actions are isolated to the MiniMask bridge in the frontend."
  });
});

export default router;
