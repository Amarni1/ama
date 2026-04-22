import { parseIntent } from "./intentParser.js";
import { requireConfirmation, validateTransaction } from "./transactionValidator.js";

export function handleChatMessage(message) {
  const parsed = parseIntent(message);

  if (parsed.intent === "BALANCE") {
    return {
      intent: "BALANCE",
      message: "Use MiniMask to fetch your wallet balance.",
      reply: "Use MiniMask to fetch your wallet balance."
    };
  }

  if (parsed.intent === "ADDRESS") {
    return {
      intent: "ADDRESS",
      message: "You can get your address via MiniMask.account.getAddress().",
      reply: "You can get your address via MiniMask.account.getAddress()."
    };
  }

  if (parsed.intent === "SEND") {
    const validation = validateTransaction({
      amount: parsed.amount,
      address: parsed.address
    });

    if (!validation.ok) {
      return {
        intent: "SEND",
        confirmationRequired: false,
        message: validation.issues[0]?.message ?? "Invalid transaction request.",
        reply: validation.issues[0]?.message ?? "Invalid transaction request.",
        issues: validation.issues
      };
    }

    return {
      intent: "SEND",
      reply: `Please confirm in MiniMask before sending ${validation.transaction.amount} Minima to ${validation.transaction.address}.`,
      ...requireConfirmation(validation.transaction)
    };
  }

  if (message.toLowerCase().includes("minima")) {
    return {
      intent: "INFO",
      message: "Minima is a fully decentralized mobile blockchain network.",
      reply: "Minima is a fully decentralized mobile blockchain network."
    };
  }

  return {
    intent: "UNKNOWN",
    message: "I can help with balance, address, send requests, and Minima basics.",
    reply: "I can help with balance, address, send requests, and Minima basics."
  };
}
