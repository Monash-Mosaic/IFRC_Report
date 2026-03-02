'use server';

const { BrevoClient } = require('@getbrevo/brevo');

/**
 * Subscribe-report stores email addresses in Brevo (for "full report coming soon" and
 * similar signups). Uses a Server Action so the API key never reaches the client.
 * Uses the Brevo SDK. Stores SUBSCRIBE_PAGE (page URL) and SUBSCRIBE_LOCALE in Brevo.
 *
 * In Brevo: create contact attributes (Contacts → Settings → Contact attributes)
 * named SUBSCRIBE_PAGE (type: Text) and SUBSCRIBE_LOCALE (type: Text).
 */
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

  const email = formData.get('email')?.toString()?.trim() ?? '';
  const location = formData.get('location')?.toString()?.trim() ?? '';
  const locale = formData.get('locale')?.toString()?.trim() ?? '';

  if (!email) {
    return { error: 'Email is required' };
  }

  if (!isValidEmail(email)) {
    return { error: 'Please enter a valid email address.' };
  }

  const listId = Number(listIdRaw);
  if (!apiKey || !listIdRaw || !Number.isInteger(listId) || listId <= 0) {
    return { error: 'Server configuration error' };
  }

  const attributes = {};
  if (location) attributes.SUBSCRIBE_PAGE = location.slice(0, 500);
  if (locale) attributes.SUBSCRIBE_LOCALE = locale.slice(0, 20);

  try {
    const brevo = new BrevoClient({ apiKey });
    await brevo.contacts.createContact({
      email,
      listIds: [listId],
      updateEnabled: true,
      ...(Object.keys(attributes).length > 0 && { attributes }),
    });
    return { success: true };
  } catch (error) {
    console.error('subscribe-report error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}
