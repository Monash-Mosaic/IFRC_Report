import { Monitor, Wifi, Smartphone, Activity, User, Building2 } from 'lucide-react';

export function parseTags(str) {
  return (str || '').split(';').map((t) => t.trim()).filter(Boolean);
}

const HARM_TAG_TO_ICON = [
  { label: 'psychological', displayLabel: 'Psychological', Icon: User },
  { label: 'societal', displayLabel: 'Societal', Icon: Building2 },
  { label: 'social', displayLabel: 'Social', Icon: Smartphone },
  { label: 'informational', displayLabel: 'Informational', Icon: Wifi },
  { label: 'digital/technological', displayLabel: 'Digital/technological', Icon: Monitor },
  { label: 'physical', displayLabel: 'Physical', Icon: Activity },
  { label: 'deprivational/financial/economic', displayLabel: 'Deprivational/financial/economic', Icon: Activity },
];

/** Resolve quote harm tags to TOH icons with labels (unique by Icon, ordered). */
export function getIconsForHarm(harmStr) {
  const tags = parseTags(harmStr).map((t) => t.toLowerCase().trim());
  const byIcon = new Map();
  for (const { label, displayLabel, Icon } of HARM_TAG_TO_ICON) {
    const labelNorm = label.toLowerCase();
    const matches = tags.some((t) => t.includes(labelNorm) || labelNorm.includes(t));
    if (matches) {
      const existing = byIcon.get(Icon);
      if (existing) existing.labels.push(displayLabel);
      else byIcon.set(Icon, { Icon, labels: [displayLabel] });
    }
  }
  return Array.from(byIcon.values());
}
