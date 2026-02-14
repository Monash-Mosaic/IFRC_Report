import { Document, Charset, Encoder, Resolver } from 'flexsearch';
import stopword from 'stopwords-en';

const SAMPLE_DOCS = {
  en: [
    {
      id: 'wdr25-chapter-02-en-1',
      title:
        'Chapter 02 > Confirmation Bias',
      excerpt: `Confirmation Bias refers to the tendency to seek out, favour and recall information that supports
our existing beliefs, while ignoring or dismissing contradictory evidence.

Although some studies (Pierre) show that users do encounter opposing views online, these interactions often trigger annoyance or hostility rather than reflection or debate. Algorithms reinforce this by amplifying divisive content, since hostility drives engagement, and engagement drives profits for platform companies. As Pariser notes, platforms are effectively “incentivizing us to fight with each other when we are online”. This dynamic is compounded by the online disinhibition effect (Suler), whereby people tend to express opinions more freely online due to factors like anonymity (hidden identities), invisibility (not being seen by others we communicate with) and asynchronicity (not engaging in real time).

These forces contribute to an erosion of shared reality. Increasingly, there are claims that disasters never happened, that scientifically validated medical treatments are unsafe or that documented atrocities are fabricated or exaggerated. This reflects what many describe as a post-trust world – one in which people are especially vulnerable to harmful information and deepening polarisation over what is considered true or false. Such polarisation increases the risk of social unrest, violence and even armed conflict. There is also a secondary level of manipulation in today’s “post-trust” world, where institutions themselves come under scrutiny and their legitimacy is increasingly contested. In some contexts, polarisation between opposing political, social or geopolitical dynamics has created conditions in which public authorities may challenge or overturn established processes or outcomes, despite the absence of clear evidence of interference or wrongdoing. This erosion of institutional credibility poses profound questions for public trust. In turn, as humanitarian actors mandated by public authorities, the National Red Cross and Red Crescent Societies face heightened reputational risks if confidence in governance continues to deteriorate.

The internet makes it easier than ever to find information that confirms existing beliefs – a phenomenon sometimes referred to as the Google delusion. Online spaces amplify confirmation bias by helping users to find like-minded communities and cite information that reinforces their views while disregarding contradictory information or expert advice. While the internet offers access to vast knowledge, it also accelerates the spread of harmful information, encourages argument over dialogue and conspiracy over evidence.

RAND researchers Kavanagh and Rich (2008) have described this phenomenon as truth decay, defined by a set of four related trends: (1) increasing disagreement about facts and analytical interpretations of facts and data; (2) a blurring of the line between opinion and fact; (3) the increasing relative volume, and resulting influence, of opinion and personal experience over fact; and, (4) declining trust in formerly respected sources of factual information. Instead of using facts to inform our beliefs, information – regardless of its truthfulness – is increasingly used to justify the beliefs already held by individuals and the groups they affiliate with. As they conclude: “We’re no longer willing to agree on something as seemingly fundamental as what counts as evidence, facts, or truth anymore”.`,
      href: '/reports/wdr25/chapter-02#confirmation-bias',
    },
    {
      id: 'wdr25-chapter-02-en-4',
      title: 'Chapter 02 > Incentivised to Hostility',
      excerpt: `This online dynamic has been described as the filter bubble, which reduces exposure to diverse perspectives and increases the risk of isolation in our views or rejection of opposing viewpoints.`,
      href: '/reports/wdr25/chapter-02#incentivised-to-hostility',
    },
    {
      id: 'wdr25-chapter-02-en-5',
      title: 'Chapter 02 > Trust in Institutions',
      excerpt:
        `Trust is critical to the legitimacy, effectiveness and acceptance of humanitarian action. This was strongly emphasised at the 2019 International Conference of the Red Cross and Red Crescent Movement which recognised that trust in principled humanitarian action is indispensable to serving vulnerable people and encouraged all members of the Conference to act to preserve and develop this trust.

The decision to place trust on the agenda reflected broader global concerns: the erosion of trust in institutions and governments, growing public scrutiny and rising demands for accountability. Where there is limited understanding of the Movement’s rules and regulations, reputational risks grow and trust declines. As the Commission Report stressed: “Trust is the most critical currency for the future of humanitarian action, and one which stems from humility and being truthful and transparent.” It identified three key priorities:

1. Community engagement and accountability.
2. A conducive environment for principled humanitarian action.
3. Integrity and risk sharing.

While harmful information was not yet identified as a central concern, the focus on trust, truth and transparency reflected growing recognition that both the Movement and States needed to do more to earn trust. It also underscored a broader challenge: preserving the space for principled humanitarian action – something the Movement cannot achieve alone. This was reaffirmed in the 2024 Council of Delegates resolution on “respect and support for principled humanitarian action” which recalls collective Movement commitments to strengthen integrity, accountability and trust.

Crucially, trust in humanitarian action does not rest solely on humanitarian actors. It also depends on a conducive environment – one in which principled, effective and accountable action is actively supported. Such an environment is shaped by the legal, political and operational frameworks established by states and other actors. This includes respect for humanitarian principles, flexible and needs-based funding, protection of humanitarian access and clear delineation of roles and responsibilities of various actors. As highlighted in Commission III discussions in 2019, states play a decisive role: their policies and practices can either foster trust and enable principled humanitarian action or hinder it. States also have a responsibility to support and facilitate the work of the National Society in their country, in their auxiliary role to public authorities. Cross reference chapter x on auxiliary role.

Creating such an environment requires sustained dialogue, shared responsibility and a commitment to removing obstacles that undermine trust. Without these conditions, even well-intentioned humanitarian efforts risk being delayed, politicised or perceived as partial – ultimately eroding the very trust they aim to build. By the time of the 34th International Conference – four years later – harmful information was recognised as part of this deeper crisis of trust.

Erosion of trust in non-governmental organisations (NGOs) has been documented in the annual Edelman Trust Barometer, which surveys trust in institutions across 28 countries. An analysis of 25 years of survey data provides valuable insights for humanitarian actors navigating this fragile landscape of shifting perceptions of trust in NGOs.`,
      href: '/reports/wdr25/chapter-02#trust-in-institutions',
    },
    {
      id: 'wdr25-chapter-02-en-6',
      title: 'Chapter 02 > Integrity, Perception and the Fragile Foundation of Trust',
      excerpt: `Cases of misconduct such as abuse, exploitation, fraud or mismanagement, have severely eroded public trust, especially when humanitarian organisations respond without transparency and empathy. Scandals involving sexual abuse in organisations have shown how quickly confidence can collapse. The politicisation of aid – when governments or armed actors manipulate humanitarian action for political purposes – further undermines perceptions of neutrality and leaves communities sceptical of humanitarian motives.

In today’s landscape of digital transparency and constant scrutiny, humanitarian actors are no longer the sole or even primary narrators of their work. They now compete for legitimacy not only with governments and non-state actors but also with communities themselves, who increasingly speak, organise and question responses in real time.

Addressing integrity issues is therefore essential. Allegations of partiality, corruption or mismanagement can deflect attention away from life-saving work and damage trust both internally within humanitarian organisations and externally with the public. The overall decline of trust in institutions is reflected in heightened scrutiny of the integrity of National Societies and other Movement components. This demands both the proactive promotion of mandates, principles and activities, and robust, strategic approaches to issues management, reputational challenges and related risks.

At the same time, humanitarian organisations face unprecedented demands for reporting, compliance and proof of impact. Failures must be acknowledged and addressed openly and transparently. In parallel, there must also be concerted efforts across sectors to counter the intentional spread of harmful information, which is both unethical and dangerous.

Finally, a lack of, or slow progress in, localising humanitarian aid, has further fuelled mistrust. Many communities perceive humanitarian action as top-down and dominated by international actors with limited local representation or contextual understanding. In some contexts, the sector is often viewed as Western-dominated, a perception reinforced by global standards, codes of conduct and coordination mechanisms developed over decades, as well as by wider global inequalities.`,
      href: '/reports/wdr25/chapter-02#integrity-perception-and-the-fragile-foundation-of-trust',
    },
    {
      id: 'wdr25-chapter-02-en-7',
      title: 'Chapter 02 > Community Engagement: A Bridge to Trust',
      excerpt: `Community Engagement and Accountability (CEA) is a vital bridge to building and sustaining trust. Trust grows through proximity, inclusive participation, timely and transparent communication and shared decision-making with people and communities. CEA also ensures that communities have access to accurate, relevant and potentially life-saving information – making it essential not only for effective humanitarian response but also for the safety and security of staff and operations.`,
      href: '/reports/wdr25/chapter-02#community-engagement-a-bridge-to-trust',
    },
    {
      id: 'wdr25-chapter-02-en-8',
      title: 'Chapter 02: Harmful Information and the Erosion of Trust in Humanitarian Response: the Role of Truth, Trust and Technology',
      excerpt: `The Shifting Ground of Trust
“To be persuasive we must be believable; to be believable we must be credible; to be credible we must be truthful.”

So said Ed Murrow, the American broadcaster and correspondent during the Second World War. The principle still holds: truth (accuracy and honesty) and credibility (competency, consistency, reliability) remain essential to building institutional trust. Yet in today’s information landscape, applying this principle has become far more complex and contested in an age shaped by harmful information.

In times of crisis or uncertainty – and these are profoundly uncertain times – people increasingly turn to information sources they perceive as relevant and aligned with their personal and lived experience, rather than those grounded solely in factual accuracy. Truth alone no longer always persuades. Emotion, identity and repetition can entrench misbeliefs in powerful, sometimes harmful ways. In such an environment, even reaching agreement on what constitutes a fact is difficult. For humanitarian organisations, whose access, acceptance and ability to operate depend on trust, navigating this fragmented, emotionally charged information space has become not only an operational challenge, but also a security risk.`,
      href: '/reports/wdr25/chapter-02',
    },
    
  ],
};

const indexCache = new Map();

function createIndex() {
  const document = new Document({
      document: {
        store: true,
        field: [
          {
              field: "title",
              tokenize: "forward",
              encoder: Charset.LatinAdvanced,
          },
          {
              field:  "excerpt",
              tokenize: "forward",
              encoder: new Encoder(Charset.LatinSoundex, { filter: stopword }),
              context: true,
          }
        ],
      },
    });

  return document;
}

/** @returns {Promise<Document>} */
async function ensureIndex(locale) {
  if (indexCache.has(locale)) {
    return indexCache.get(locale);
  }

  const index = createIndex();
  const docs = SAMPLE_DOCS.en || [];
  docs.forEach((doc) => {
    index.add(doc['id'], doc);
  });

  indexCache.set(locale, index);
  return index;
}

export async function searchDocuments({ locale, query, limit = 10 }) {
  const safeQuery = query?.trim();
  if (!safeQuery) return [];
  
  // TODO: Making this function faster would improve overall search performance
  console.time(`ensureIndex for ${locale}`);
  const index = await ensureIndex(locale);
  console.timeEnd(`ensureIndex for ${locale}`);

  console.time(`searchCache for ${safeQuery}`);
  const rawResults = await index.searchCacheAsync({
    query: safeQuery,
    limit,
    enrich: true,
    merge: true,
    highlight: {
      template: "<em>$1</em>",
      boundary: 500,
      merge: true,
      clip: false,
    },
    suggest: true,
    pluck: "excerpt",
  });
  console.timeEnd(`searchCache for ${safeQuery}`);

  return rawResults.map((result) => ({
    id: result.doc.id,
    title: result.doc.title,
    highlight: result.highlight,
    href: result.doc.href,
  }));
}
