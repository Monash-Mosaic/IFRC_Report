'use server';

/**
 * Report-incident is implemented as a Server Action (instead of an API route) for built-in
 * security and alignment with Next.js forms. See: https://nextjs.org/docs/app/guides/forms
 */
import crypto from 'node:crypto';

const NOTION_VERSION = '2022-06-28';

export async function reportIncident(prevState, formData) {
  const secret = process.env.NOTION_SECRET;
  const databaseId = process.env.NOTION_INCIDENT_DATABASE_ID;

  if (!secret || !databaseId) {
    return { error: 'Server configuration error' };
  }

  const description = formData.get('description')?.toString()?.trim() ?? '';
  const location = formData.get('location')?.toString()?.trim() ?? '';

  if (!description) {
    return { error: 'Description is required' };
  }

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const timePart = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  // Use crypto.randomBytes instead of Math.random() for the incident ID suffix. Math.random() is
  // insufficient for security tooling (Bearer CWE-330); crypto avoids "insufficiently random values" findings.
  const suffix = crypto.randomBytes(1)[0].toString(16).padStart(2, '0');
  const incidentId = `IFMS-${datePart}-${timePart}-${suffix}`;
  const reportedAt = now.toISOString();

  // Property names must match your Notion database exactly. If "Details" doesn't exist, rename to your property (e.g. "Summary", "Notes").
  // Location: set the Notion property type to URL so the webpage URL where the issue occurred is stored.
  const properties = {
    'Incident ID': {
      title: [{ text: { content: incidentId } }],
    },
    'Reported At': {
      date: { start: reportedAt },
    },
    Details: {
      rich_text: [{ text: { content: description.slice(0, 2000) } }],
    },
    Location: {
      url: location || '',
    },
  };

  try {
    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
        'Notion-Version': NOTION_VERSION,
      },
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties,
      }),
    });

    if (!res.ok) {
      await res.json().catch(() => ({}));
      // Generic message only—do not log res.status or response body (Bearer CWE-532) to avoid
      // information leakage in logs.
      console.error('Notion API error');
      return { error: 'Failed to create incident' };
    }

    return { success: true };
  } catch {
    console.error('Report incident error');
    return { error: 'Failed to create incident' };
  }
}
