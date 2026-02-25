import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

const NOTION_VERSION = '2022-06-28';

export async function POST(request) {
  const secret = process.env.NOTION_SECRET;
  const databaseId = process.env.NOTION_INCIDENT_DATABASE_ID;

  if (!secret || !databaseId) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const location = typeof body.location === 'string' ? body.location.trim() : '';

  if (!description) {
    return NextResponse.json(
      { error: 'Description is required' },
      { status: 400 }
    );
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
      console.error('Notion API error:', res.status);
      return NextResponse.json(
        { error: 'Failed to create incident' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    console.error('Report incident error');
    return NextResponse.json(
      { error: 'Failed to create incident' },
      { status: 500 }
    );
  }
}
