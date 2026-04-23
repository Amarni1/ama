import express from "express";
import { z } from "zod";
import {
  createSwapRequest,
  getSwapConfig,
  getSwapRequest,
  listSwapHistory,
  submitSwapDeposit
} from "../services/swapOrchestrator.js";
import { buildSwapQuote } from "../services/swapEngine.js";

const router = express.Router();

const quoteSchema = z.object({
  amount: z.coerce.number().positive(),
  fromToken: z.string().trim().min(1),
  toToken: z.string().trim().min(1)
});

const createRequestSchema = quoteSchema.extend({
  walletAddress: z.string().trim().min(3)
});

const submitSchema = z.object({
  txpowid: z.string().trim().min(1),
  walletAddress: z.string().trim().min(3).optional()
});

router.get("/config", (_request, response) => {
  response.json(getSwapConfig());
});

router.post("/quote", (request, response) => {
  const parsed = quoteSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      message: "Invalid swap quote payload.",
      issues: parsed.error.flatten()
    });
  }

  const quote = buildSwapQuote(
    parsed.data.amount,
    parsed.data.fromToken,
    parsed.data.toToken
  );

  if (!quote) {
    return response.status(400).json({
      message: "Unable to build a quote for that swap."
    });
  }

  return response.json({
    message: quote.executionReady
      ? "Quote ready for MiniMask submission."
      : quote.missingConfig[0] || "Quote ready, but treasury execution is not fully configured.",
    quote
  });
});

router.post("/requests", (request, response) => {
  const parsed = createRequestSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      message: "Invalid swap request payload.",
      issues: parsed.error.flatten()
    });
  }

  try {
    const swapRequest = createSwapRequest(parsed.data);
    return response.status(201).json({
      message: "Swap request created. Send the deposit through MiniMask to continue.",
      request: swapRequest
    });
  } catch (error) {
    return response.status(400).json({
      message: error.message || "Unable to create swap request."
    });
  }
});

router.post("/requests/:recordId/submit", (request, response) => {
  const parsed = submitSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      message: "Invalid swap submission payload.",
      issues: parsed.error.flatten()
    });
  }

  try {
    const swapRequest = submitSwapDeposit({
      recordId: request.params.recordId,
      txpowid: parsed.data.txpowid,
      walletAddress: parsed.data.walletAddress
    });

    return response.json({
      message: "Swap deposit submitted. Waiting for on-chain verification.",
      request: swapRequest
    });
  } catch (error) {
    return response.status(400).json({
      message: error.message || "Unable to submit swap deposit."
    });
  }
});

router.get("/requests/:recordId", (request, response) => {
  try {
    return response.json({
      request: getSwapRequest(request.params.recordId)
    });
  } catch (error) {
    return response.status(404).json({
      message: error.message || "Swap request not found."
    });
  }
});

router.get("/history", (request, response) => {
  const walletAddress = String(request.query.wallet || "").trim();

  return response.json({
    history: listSwapHistory(walletAddress)
  });
});

export default router;
