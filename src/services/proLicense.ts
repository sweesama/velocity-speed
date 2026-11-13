/**
 * Velocity Pro 零后端离线加密通行证与「创始内测官」编号引擎
 *
 * 1. 社区内测通兑码 (Campaign Codes)：如 BETA100, FOUNDER, VIP888, EARLY2026
 * 2. 一客一码无限序列号 (VELO-XXXX-XXXX)：32^4 = 1,048,576 种独立组合，支持无限生成、离线秒级防伪校验
 * 3. 开发者暗号 (ADMIN888)：在兑换框输入 ADMIN888 即可唤出内置「一客一码批量发码器」
 */

const CAMPAIGN_CODES = new Set([
  'BETA100',
  'FOUNDER',
  'EARLY2026',
  'VELOCITY',
  'VIP888',
  'XHS2026',
  'PRO2026'
])

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

function computeChecksum(seed: string): string {
  let hash = 0x811c9dc5
  const salted = `VELOCITY_PRO_2026_${seed.toUpperCase()}`
  for (let i = 0; i < salted.length; i++) {
    hash ^= salted.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  let out = ''
  let val = Math.abs(hash)
  for (let i = 0; i < 4; i++) {
    out += ALPHABET[val % ALPHABET.length]
    val = Math.floor(val / ALPHABET.length)
  }
  return out
}

export function verifyProLicenseCode(rawInput: string): {
  valid: boolean
  isAdminTrigger?: boolean
  normalizedCode: string
  founderNumber: string
  type: 'campaign' | 'serial' | 'admin' | 'invalid'
} {
  const cleaned = (rawInput || '').trim().toUpperCase().replace(/\s+/g, '')
  if (!cleaned) {
    return { valid: false, normalizedCode: '', founderNumber: '', type: 'invalid' }
  }

  // 开发者暗号: 唤醒内置发码器
  if (cleaned === 'ADMIN888') {
    return {
      valid: false,
      isAdminTrigger: true,
      normalizedCode: 'ADMIN888',
      founderNumber: '#001',
      type: 'admin'
    }
  }

  // 1. 社区内测活动通兑码
  if (CAMPAIGN_CODES.has(cleaned)) {
    return {
      valid: true,
      normalizedCode: cleaned,
      founderNumber: getFounderNumber(cleaned),
      type: 'campaign'
    }
  }

  // 2. 一客一码专属序列号 (VELO-XXXX-XXXX，共 104 万种不重复组合)
  const serialMatch = cleaned.match(/^VELO-?([A-Z0-9]{4})-?([A-Z0-9]{4})$/)
  if (serialMatch) {
    const seed = serialMatch[1]
    const sig = serialMatch[2]
    if (computeChecksum(seed) === sig) {
      const code = `VELO-${seed}-${sig}`
      return {
        valid: true,
        normalizedCode: code,
        founderNumber: getFounderNumber(seed),
        type: 'serial'
      }
    }
  }

  return { valid: false, normalizedCode: cleaned, founderNumber: '', type: 'invalid' }
}

/**
 * 根据激活码生成专属「创始内测官编号」 (例如 #001 ~ #099)
 */
export function getFounderNumber(codeOrSeed: string): string {
  const saved = localStorage.getItem('velocity_founder_no')
  if (saved) return saved
  let sum = 0
  const str = `${codeOrSeed}_${Date.now().toString().slice(-3)}`
  for (let i = 0; i < str.length; i++) {
    sum = (sum * 31 + str.charCodeAt(i)) % 98
  }
  const num = `#${String(sum + 2).padStart(3, '0')}`
  localStorage.setItem('velocity_founder_no', num)
  return num
}

/**
 * 批量生成不重复的「一客一码」专属序列号
 */
export function generateBatchLicenseKeys(count: number = 20): string[] {
  const keys: string[] = []
  const used = new Set<string>()
  while (keys.length < count) {
    let seed = ''
    for (let i = 0; i < 4; i++) {
      seed += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
    }
    if (!used.has(seed)) {
      used.add(seed)
      keys.push(`VELO-${seed}-${computeChecksum(seed)}`)
    }
  }
  return keys
}
