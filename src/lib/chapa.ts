export const CHAPA_BASE_URL = "https://api.chapa.co/v1";

// Mock Bank Codes
export const BANK_MAP: Record<string, string> = {
  CBE: "9",
  "Commercial Bank of Ethiopia": "9",
  Awash: "1",
  "Awash Bank": "1",
  Dashen: "2",
  "Dashen Bank": "2",
  Abyssinia: "3",
  "Bank of Abyssinia": "3",
  Telebirr: "85",
  "M-Pesa": "86",
};

export async function initiateChapaTransaction(payload: any) {
  const response = await fetch(`${CHAPA_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
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
      cache: "no-store",
    },
  );

  if (!response.ok) return null;
  return response.json();
}

// --- UPDATED TRANSFER LOGIC (SIMULATION MODE) ---
export async function initiateChapaTransfer(payload: {
  account_name: string;
  account_number: string;
  amount: number;
  currency: string;
  reference: string;
  bank_code: string;
}) {
  console.log(
    `Attempting Transfer: ${payload.amount} ETB to ${payload.account_name}`,
  );

  // 1. CHECK FOR TEST KEY
  // If we are using a Test Key, we SKIP calling Chapa for transfers
  // because unverified accounts cannot make transfers (even mock ones).
  if (process.env.CHAPA_SECRET_KEY?.includes("TEST")) {
    console.log("⚠️ TEST MODE DETECTED: Simulating successful transfer.");

    // Simulate a 1-second delay like a real bank
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      status: "success",
      message: "Transfer Successful (Simulated)",
      data: { reference: "SIM-" + payload.reference },
    };
  }

  // 2. REAL PRODUCTION LOGIC (Only runs if you have a Live Key)
  const response = await fetch(`${CHAPA_BASE_URL}/transfers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  return response.json();
}
