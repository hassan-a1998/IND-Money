/** Mock SmartKYC persona & copy */
export const MOCK_USER_NAME = 'Rohan Mehta'

export const USER_TYPES = [
  { id: 'resident', label: 'Resident Indian' },
  { id: 'nri', label: 'NRI' },
  { id: 'minor', label: 'Minor (with guardian)' },
  { id: 'huf', label: 'HUF' },
]

export const PAN_PLACEHOLDER = 'ABCDE1234F'

/** Regex: 5 letters, 4 digits, 1 letter */
export const PAN_FORMAT_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/
