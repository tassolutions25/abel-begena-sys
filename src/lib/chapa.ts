// src/lib/chapa.ts
export const CHAPA_BASE_URL = "https://api.chapa.co/v1";

export async function initiateChapaTransaction(payload: {
  amount: number;
  currency: string;
  email: string;
  first_name: string;
  last_name: string;
  tx_ref: string;
  callback_url: string;
  return_url: string;
  customization?: {
    title: string;
    description: string;
  };
}) {
  const response = await fetch(`${CHAPA_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}

export async function verifyChapaTransaction(txRef: string) {
  const response = await fetch(
    `${CHAPA_BASE_URL}/transaction/verify/${txRef}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      },
    },
  );

  return response.json();
}
