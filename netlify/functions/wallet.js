export default async () => {
  return Response.json({
    status: "ready",
    message: "Wallet actions are isolated to the MiniMask bridge in the frontend."
  });
};

export const config = {
  path: "/api/wallet"
};
