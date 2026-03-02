'use server';

/**
 * Subscribe-report stores email addresses in Brevo (for "full report coming soon" and
 * similar signups). Uses a Server Action so the API key never reaches the client.
 * Stores the page URL (location) in Brevo so you can see which page the user subscribed from.
 *
 * In Brevo: create a contact attribute (Contacts → Settings → Contact attributes)
 * named SUBSCRIBE_PAGE (type: Text) and SUBSCRIBE_LOCALE (type: Text) for the page URL
 * and web locale (e.g. en, zh). If omitted, the contact is still created and added to the list.
 */
const BREVO_API = 'https://api.brevo.com/v3/contacts';

function isValidEmail(value) {
  if (typeof value !== 'string' || value.length > 254) return false;
  const at = value.indexOf('@');
  if (at <= 0 || at === value.length - 1) return false;
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
  return local.length <= 64 && domain.length <= 190;
}

export async function subscribeReport(prevState, formData) {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const listIdRaw = process.env.BREVO_LIST_ID?.trim();

  if (!apiKey || !listIdRaw) {
    return { error: 'Server configuration error' };
  }

  const listId = Number(listIdRaw);
  if (!Number.isInteger(listId) || listId <= 0) {
    return { error: 'Server configuration error' };
  }

  const email = formData.get('email')?.toString()?.trim() ?? '';
  const location = formData.get('location')?.toString()?.trim() ?? '';
  const locale = formData.get('locale')?.toString()?.trim() ?? '';

  if (!email) {
    return { error: 'Email is required' };
  }

  if (!isValidEmail(email)) {
    return { error: 'Please enter a valid email address.' };
  }

  const body = {
    email,
    listIds: [listId],
    updateEnabled: true,
  };

  if (location || locale) {
    body.attributes = {};
    if (location) body.attributes.SUBSCRIBE_PAGE = location.slice(0, 500);
    if (locale) body.attributes.SUBSCRIBE_LOCALE = locale.slice(0, 20);
  }

  try {
    const res = await fetch(BREVO_API, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      return { success: true };
    }

    const data = await res.json().catch(() => ({}));
    if (res.status === 400 && body.attributes && data?.message?.includes?.('attribute')) {
      body.attributes = undefined;
      const retry = await fetch(BREVO_API, {
        method: 'POST',
        headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (retry.ok) return { success: true };
    }

    return { error: 'Something went wrong. Please try again.' };
  } catch {
    return { error: 'Something went wrong. Please try again.' };
  }
}
