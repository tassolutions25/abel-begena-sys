export const CHAPA_BASE_URL = "https://api.chapa.co/v1";

export async function initiateChapaTransaction(payload: any) {
  const response = await fetch(`${CHAPA_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store", // <--- IMPORTANT: Disable Caching
  });

  return response.json();
}

export async function verifyChapaTransaction(txRef: string) {
  console.log(`Verifying Chapa TX: ${txRef}`);

  const response = await fetch(
    `${CHAPA_BASE_URL}/transaction/verify/${txRef}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      },
      cache: "no-store", // <--- IMPORTANT: Disable Caching
    },
  );

  if (!response.ok) {
    console.error("Chapa Verify API Error Status:", response.status);
    return null;
  }

  return response.json();
}
