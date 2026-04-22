import { z } from "zod";

export const transactionSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero."),
  address: z
    .string()
    .min(4, "Address is required.")
    .regex(/^mx[a-z0-9]+$/i, "Address must look like a Minima wallet address.")
});

export function validateTransaction(payload) {
  const result = transactionSchema.safeParse(payload);

  if (!result.success) {
    return {
      ok: false,
      issues: result.error.issues
    };
  }

  return {
    ok: true,
    transaction: result.data
  };
}

export function requireConfirmation(transaction) {
  return {
    approved: false,
    confirmationRequired: true,
    transaction,
    message: `Confirm sending ${transaction.amount} Minima to ${transaction.address}`
  };
}
