const passwordPolicyRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/

export const passwordPolicyPattern =
  '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,}'

export const passwordPolicyHint =
  'Password mesti sekurang-kurangnya 8 aksara dan mengandungi huruf besar, huruf kecil, nombor, dan simbol.'

export function isStrongPassword(value: string) {
  return passwordPolicyRegex.test(value)
}
