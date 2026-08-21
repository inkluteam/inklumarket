const BANNED_WORDS = [
  'scam', 'fraud', 'fake id', 'counterfeit', 'kill', 'hate', 'stupid',
  'idiot', 'harass', 'threat', 'abuse', 'nonsense', 'trash seller'
]

export function containsBannedWords(text) {
  const t = String(text || '').toLowerCase()
  return BANNED_WORDS.find(w => t.includes(w)) || null
}

export function cleanText(text) {
  let out = String(text || '')
  BANNED_WORDS.forEach(w => {
    out = out.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '*'.repeat(w.length))
  })
  return out
}
