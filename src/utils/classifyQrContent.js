const CRYPTO_SCHEMES = ["bitcoin", "ethereum", "litecoin", "dogecoin", "monero"];

const CURRENCY_CODES = {
  "702": "SGD", "840": "USD", "356": "INR", "458": "MYR", "764": "THB",
  "608": "PHP", "360": "IDR", "704": "VND", "978": "EUR", "826": "GBP",
  "156": "CNY", "392": "JPY", "036": "AUD", "124": "CAD",
};

// EMVCo QR Code payloads (PayNow, PayLah!, SGQR, and most Asian payment
// QR standards) are a flat sequence of 2-digit-ID + 2-digit-length + value
// fields, always starting with tag "00" (Payload Format Indicator) = "01".
function parseEmvTlv(str) {
  const fields = {};
  let i = 0;
  while (i + 4 <= str.length) {
    const id = str.slice(i, i + 2);
    const len = parseInt(str.slice(i + 2, i + 4), 10);
    if (Number.isNaN(len) || i + 4 + len > str.length) break;
    fields[id] = str.slice(i + 4, i + 4 + len);
    i += 4 + len;
  }
  return fields;
}

function parseEmvPayment(str) {
  const fields = parseEmvTlv(str);
  return {
    merchantName: fields["59"] || null,
    merchantCity: fields["60"] || null,
    amount: fields["54"] || null,
    currency: CURRENCY_CODES[fields["53"]] || fields["53"] || null,
    countryCode: fields["58"] || null,
  };
}

function parseUpiPayment(str) {
  try {
    const params = new URL(str).searchParams;
    return {
      payee: params.get("pa"),
      merchantName: params.get("pn"),
      amount: params.get("am"),
      currency: params.get("cu"),
    };
  } catch {
    return {};
  }
}

function parseCryptoPayment(str, scheme) {
  const withoutScheme = str.slice(scheme.length + 1);
  const [address, query] = withoutScheme.split("?");
  const params = new URLSearchParams(query || "");
  return {
    payee: address || null,
    amount: params.get("amount"),
    currency: scheme.toUpperCase(),
  };
}

export function classifyQrContent(text) {
  const trimmed = (text ?? "").trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return { type: "website", raw: trimmed };
  }

  if (/^000201/.test(trimmed)) {
    return { type: "payment", raw: trimmed, payment: parseEmvPayment(trimmed) };
  }

  if (/^upi:\/\//i.test(trimmed)) {
    return { type: "payment", raw: trimmed, payment: parseUpiPayment(trimmed) };
  }

  if (/^BEGIN:VCARD/i.test(trimmed)) {
    return { type: "contact", raw: trimmed };
  }

  const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase();

    if (CRYPTO_SCHEMES.includes(scheme)) {
      return { type: "payment", raw: trimmed, payment: parseCryptoPayment(trimmed, scheme) };
    }
    if (scheme === "wifi") {
      return { type: "wifi", raw: trimmed };
    }
    if (scheme === "mecard") {
      return { type: "contact", raw: trimmed };
    }

    return { type: "app-link", raw: trimmed, scheme };
  }

  return { type: "text", raw: trimmed };
}
