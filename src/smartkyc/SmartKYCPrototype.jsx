import { useEffect, useMemo, useState } from 'react'
import {
  MOCK_USER_NAME,
  PAN_FORMAT_REGEX,
  PAN_PLACEHOLDER,
  USER_TYPES,
} from './mockData.js'

const TOTAL_FLOW_STEPS = 7

function focusOtpSlot(index) {
  document.getElementById(`otp-slot-${index}`)?.focus()
}

const TABS = [
  { id: 'home', label: 'Home' },
  { id: 'status', label: 'Status' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'profile', label: 'Profile' },
]

function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}

function IconHome({ active }) {
  return (
    <svg
      className={cn('h-6 w-6', active ? 'text-[#4F46E5]' : 'text-gray-400')}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  )
}

function IconStatus({ active }) {
  return (
    <svg
      className={cn('h-6 w-6', active ? 'text-[#4F46E5]' : 'text-gray-400')}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

function IconBell({ active }) {
  return (
    <svg
      className={cn('h-6 w-6', active ? 'text-[#4F46E5]' : 'text-gray-400')}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  )
}

function IconUser({ active }) {
  return (
    <svg
      className={cn('h-6 w-6', active ? 'text-[#4F46E5]' : 'text-gray-400')}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  )
}

function INDLogo() {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#4F46E5] text-sm font-bold text-white shadow-md shadow-indigo-500/25">
        IND
      </div>
      <span className="text-xl font-semibold tracking-tight text-gray-900">
        INDmoney
      </span>
    </div>
  )
}

function StepProgress({ current, total }) {
  const pct = Math.min(100, Math.round((current / total) * 100))
  return (
    <header className="sticky top-0 z-20 border-b border-gray-100 bg-[#F9FAFB]/95 px-4 pb-3 pt-3 backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between text-xs font-medium text-gray-600">
        <span>
          Step {current} of {total}
        </span>
        <span className="text-[#4F46E5]">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-[#4F46E5] transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </header>
  )
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-[#10B981] ring-1 ring-[#10B981]/25">
      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
      Verified
    </span>
  )
}

export default function SmartKYCPrototype() {
  const [activeTab, setActiveTab] = useState('home')

  /** 1–5 = Home onboarding screens; used with StepProgress mapping */
  const [onboardingStep, setOnboardingStep] = useState(1)
  /** risk | verified | manual_review | rejected — Status tab views */
  const [statusScenario, setStatusScenario] = useState('idle')

  const [userType, setUserType] = useState(null)
  const [panInput, setPanInput] = useState('')
  const [aadhaarDigits, setAadhaarDigits] = useState('')
  const [aadhaarConsent, setAadhaarConsent] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', ''])
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(30)
  const [aadhaarVerified, setAadhaarVerified] = useState(false)

  const [panDoc, setPanDoc] = useState(null)
  const [addrDoc, setAddrDoc] = useState(null)

  const [selfiePhase, setSelfiePhase] = useState('idle')

  const [riskSteps, setRiskSteps] = useState([
    { id: 'ckyc', label: 'Checking CKYC database...', state: 'pending' },
    { id: 'nsdl', label: 'Verifying PAN with NSDL...', state: 'pending' },
    { id: 'aml', label: 'Running AML screening...', state: 'pending' },
    { id: 'addr', label: 'Validating address proof...', state: 'pending' },
  ])

  const [faqOpen, setFaqOpen] = useState(null)
  const [alertSnack, setAlertSnack] = useState(null)

  const panNormalized = panInput.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const panValid = PAN_FORMAT_REGEX.test(panNormalized)

  const progressStep = useMemo(() => {
    if (activeTab === 'home') return onboardingStep
    if (activeTab === 'status') {
      if (statusScenario === 'risk') return 6
      if (statusScenario === 'verified') return 7
    }
    return onboardingStep
  }, [activeTab, onboardingStep, statusScenario])

  const showFlowProgress =
    activeTab === 'home' ||
    (activeTab === 'status' &&
      (statusScenario === 'risk' || statusScenario === 'verified'))

  useEffect(() => {
    if (!otpSent || aadhaarVerified) return
    const id = setInterval(() => {
      setOtpSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [otpSent, aadhaarVerified])

  const handleSendOtp = () => {
    setOtpSent(true)
    setOtpSecondsLeft(30)
    setOtpValues(['', '', '', '', '', ''])
    queueMicrotask(() => focusOtpSlot(0))
  }

  const handleOtpChange = (index, char) => {
    const digit = char.replace(/\D/g, '').slice(-1)
    const next = [...otpValues]
    next[index] = digit
    setOtpValues(next)
    if (digit && index < 5) queueMicrotask(() => focusOtpSlot(index + 1))
    const joined = next.join('')
    if (joined.length === 6 && /^\d{6}$/.test(joined)) {
      setAadhaarVerified(true)
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      focusOtpSlot(index - 1)
    }
  }

  /** Risk engine animation + auto-advance (~3s) */
  useEffect(() => {
    if (statusScenario !== 'risk') return undefined

    let cancelled = false

    const t1 = setTimeout(() => {
      if (cancelled) return
      setRiskSteps((prev) =>
        prev.map((row) =>
          row.id === 'ckyc' ? { ...row, state: 'done' } : row,
        ),
      )
    }, 1400)

    const t2 = setTimeout(() => {
      if (cancelled) return
      setRiskSteps((prev) =>
        prev.map((row) =>
          row.id === 'aml' ? { ...row, state: 'done' } : row,
        ),
      )
    }, 2600)

    const t3 = setTimeout(() => {
      if (!cancelled) setStatusScenario('verified')
    }, 3000)

    return () => {
      cancelled = true
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [statusScenario])

  const beginRiskPhase = () => {
    /** Snapshot: PAN & address already verified; CKYC + AML still running */
    setRiskSteps([
      { id: 'ckyc', label: 'Checking CKYC database...', state: 'running' },
      { id: 'nsdl', label: 'Verifying PAN with NSDL...', state: 'done' },
      { id: 'aml', label: 'Running AML screening...', state: 'running' },
      { id: 'addr', label: 'Validating address proof...', state: 'done' },
    ])
    setStatusScenario('risk')
    setActiveTab('status')
  }

  const handlePanUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPanDoc({ url, quality: 'good' })
    e.target.value = ''
  }

  const handleAddrUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    /** Second upload demonstrates AI coach amber state once */
    setAddrDoc((prev) => ({
      url,
      quality: prev?.seenPoorDemo ? 'good' : 'poor',
      seenPoorDemo: true,
    }))
    e.target.value = ''
  }

  const docsReady =
    panDoc?.quality === 'good' && addrDoc?.quality === 'good'

  const primaryButtonClasses =
    'w-full rounded-xl bg-[#4F46E5] px-4 py-3.5 text-center text-sm font-semibold text-white shadow-sm shadow-indigo-500/30 active:scale-[0.99] transition-transform disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none'

  const ghostButtonClasses =
    'w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-center text-sm font-semibold text-gray-800 active:bg-gray-50'

  const maskAadhaarInput = (raw) => raw.replace(/\D/g, '').slice(0, 12)

  const renderRiskRow = (row) => {
    const icon =
      row.state === 'done' ? (
        <span className="text-[#10B981]" aria-hidden>
          ✓
        </span>
      ) : row.state === 'running' ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#4F46E5] border-t-transparent" />
      ) : (
        <span className="h-4 w-4 rounded-full border border-gray-200 bg-gray-50" />
      )
    return (
      <div
        key={row.id}
        className="flex items-center gap-3 rounded-xl bg-white px-3 py-3 shadow-sm ring-1 ring-gray-100"
      >
        <div className="flex h-8 w-8 items-center justify-center">{icon}</div>
        <p className="flex-1 text-left text-sm font-medium text-gray-800">
          {row.label}
        </p>
      </div>
    )
  }

  const renderHomeBody = () => {
    switch (onboardingStep) {
      case 1:
        return (
          <div className="px-4 pb-28 pt-6">
            <INDLogo />
            <h1 className="mb-2 text-center text-2xl font-bold tracking-tight text-gray-900">
              Let&apos;s set up your account
            </h1>
            <p className="mb-8 text-center text-sm text-gray-500">
              Takes less than 2 minutes
            </p>
            <div className="grid gap-3">
              {USER_TYPES.map((ut) => {
                const selected = userType === ut.id
                return (
                  <button
                    key={ut.id}
                    type="button"
                    onClick={() => setUserType(ut.id)}
                    className={cn(
                      'rounded-2xl border-2 bg-white px-4 py-4 text-left text-sm font-semibold text-gray-900 shadow-sm transition-colors',
                      selected
                        ? 'border-[#4F46E5] ring-2 ring-[#4F46E5]/15'
                        : 'border-gray-100 hover:border-gray-200',
                    )}
                  >
                    {ut.label}
                  </button>
                )
              })}
            </div>
            {userType === 'nri' && (
              <div className="mt-4 rounded-xl bg-indigo-50 px-3 py-3 text-xs leading-relaxed text-indigo-900 ring-1 ring-indigo-100">
                You&apos;ll need your passport + overseas address proof
              </div>
            )}
            <div className="mt-10">
              <button
                type="button"
                disabled={!userType}
                className={primaryButtonClasses}
                onClick={() => userType && setOnboardingStep(2)}
              >
                Get started
              </button>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="px-4 pb-28 pt-6">
            <h1 className="mb-1 text-xl font-bold text-gray-900">
              Verify your PAN
            </h1>
            <p className="mb-6 text-sm text-gray-500">
              Enter details exactly as on your PAN card.
            </p>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Enter your PAN number
            </label>
            <div className="relative">
              <input
                type="text"
                autoCapitalize="characters"
                autoCorrect="off"
                maxLength={10}
                placeholder={PAN_PLACEHOLDER}
                value={panNormalized}
                onChange={(e) =>
                  setPanInput(e.target.value.toUpperCase().replace(/\s/g, ''))
                }
                className={cn(
                  'w-full rounded-xl border-2 bg-white px-4 py-3.5 text-base font-mono tracking-widest outline-none transition-colors',
                  panNormalized.length === 0 && 'border-gray-200',
                  panNormalized.length > 0 &&
                    (panValid
                      ? 'border-[#10B981] ring-2 ring-emerald-500/15'
                      : 'border-[#EF4444] ring-2 ring-red-500/10'),
                )}
              />
              {panNormalized.length > 0 && (
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  {panValid ? (
                    <svg
                      className="h-6 w-6 text-[#10B981]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-6 w-6 text-[#EF4444]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </span>
              )}
            </div>
            {panNormalized.length > 0 && !panValid && (
              <p className="mt-2 text-xs font-medium text-[#EF4444]">
                PAN format should be 5 letters, 4 digits, 1 letter (e.g.
                ABCDE1234F).
              </p>
            )}
            {panValid && (
              <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      PAN linked to:
                    </p>
                    <p className="mt-1 text-base font-semibold text-gray-900">
                      {MOCK_USER_NAME}
                    </p>
                  </div>
                  <VerifiedBadge />
                </div>
              </div>
            )}
            <div className="mt-6 rounded-xl bg-gray-50 px-3 py-3 text-xs leading-relaxed text-gray-600 ring-1 ring-gray-100">
              Your PAN helps us verify your identity with NSDL
            </div>
            <div className="mt-10">
              <button
                type="button"
                disabled={!panValid}
                className={primaryButtonClasses}
                onClick={() => panValid && setOnboardingStep(3)}
              >
                Verify PAN
              </button>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="px-4 pb-28 pt-6">
            <h1 className="mb-6 text-xl font-bold text-gray-900">
              Link your Aadhaar
            </h1>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Aadhaar number
            </label>
            <div className="relative mb-6 overflow-hidden rounded-xl border-2 border-gray-200 bg-white focus-within:border-[#4F46E5]">
              <div className="pointer-events-none px-4 py-3.5 font-mono text-lg tracking-[0.2em] text-gray-900">
                {(() => {
                  const tail = aadhaarDigits.slice(8).padEnd(4, '•')
                  return `•••• •••• ${tail}`
                })()}
              </div>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="off"
                maxLength={12}
                value={aadhaarDigits}
                aria-label="Aadhaar number"
                onChange={(e) =>
                  setAadhaarDigits(maskAadhaarInput(e.target.value))
                }
                className="absolute inset-0 z-10 cursor-text opacity-0"
              />
            </div>
            <label className="flex cursor-pointer gap-3 rounded-xl bg-gray-50 p-4 ring-1 ring-gray-100">
              <input
                type="checkbox"
                checked={aadhaarConsent}
                onChange={(e) => setAadhaarConsent(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-[#4F46E5] focus:ring-[#4F46E5]"
              />
              <span className="text-left text-xs leading-relaxed text-gray-700">
                I consent to sharing my Aadhaar data for eKYC as per UIDAI
                guidelines
              </span>
            </label>
            {!otpSent && (
              <button
                type="button"
                disabled={aadhaarDigits.length !== 12 || !aadhaarConsent}
                className={cn(primaryButtonClasses, 'mt-8')}
                onClick={handleSendOtp}
              >
                Send OTP to linked mobile
              </button>
            )}
            {otpSent && (
              <div className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">
                    Enter OTP
                  </p>
                  <p className="text-xs font-medium text-gray-500">
                    {otpSecondsLeft > 0
                      ? `Resend in ${otpSecondsLeft}s`
                      : 'You can resend now'}
                  </p>
                </div>
                <div className="flex justify-between gap-2">
                  {otpValues.map((d, i) => (
                    <input
                      key={i}
                      id={`otp-slot-${i}`}
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="h-12 w-10 rounded-lg border-2 border-gray-200 text-center text-lg font-semibold outline-none focus:border-[#4F46E5]"
                      aria-label={`Digit ${i + 1}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  disabled={otpSecondsLeft > 0}
                  className={cn(
                    'mt-4 text-sm font-semibold',
                    otpSecondsLeft > 0 ? 'text-gray-400' : 'text-[#4F46E5]',
                  )}
                  onClick={handleSendOtp}
                >
                  Resend OTP
                </button>
                {aadhaarVerified && (
                  <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100">
                    <svg
                      className="h-5 w-5 shrink-0 text-[#10B981]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Aadhaar verified
                  </div>
                )}
              </div>
            )}
            <div className="mt-10">
              <button
                type="button"
                disabled={!aadhaarVerified}
                className={primaryButtonClasses}
                onClick={() => aadhaarVerified && setOnboardingStep(4)}
              >
                Continue
              </button>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="px-4 pb-28 pt-6">
            <h1 className="mb-2 text-xl font-bold text-gray-900">
              Upload your documents
            </h1>
            <p className="mb-6 text-sm text-gray-500">
              Take a clear photo — our AI coach helps you get it right.
            </p>
            <div className="grid gap-4">
              {[
                {
                  title: 'PAN Card photo',
                  doc: panDoc,
                  onFile: handlePanUpload,
                  id: 'pan',
                },
                {
                  title: 'Address Proof (Aadhaar / Passport / Utility bill)',
                  doc: addrDoc,
                  onFile: handleAddrUpload,
                  id: 'addr',
                },
              ].map((card) => (
                <div key={card.id} className="relative">
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-4 py-8 text-center transition-colors hover:border-[#4F46E5]/40">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={card.onFile}
                    />
                    <svg
                      className="mb-3 h-10 w-10 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm font-semibold text-gray-800">
                      {card.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Take photo or upload
                    </p>
                  </label>
                  {card.doc && (
                    <div className="absolute inset-0 overflow-hidden rounded-2xl ring-2 ring-[#4F46E5]/20">
                      <img
                        src={card.doc.url}
                        alt=""
                        className="h-full w-full object-cover opacity-90"
                      />
                      <div
                        className={cn(
                          'absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold',
                          card.doc.quality === 'good'
                            ? 'bg-emerald-600/95 text-white'
                            : 'bg-[#F59E0B] text-gray-900',
                        )}
                      >
                        <span className="flex-1">
                          {card.doc.quality === 'good'
                            ? 'Document looks clear — good to go'
                            : 'Image too dark. Move to better lighting and retake'}
                        </span>
                        {card.doc.quality === 'poor' && (
                          <button
                            type="button"
                            className="shrink-0 rounded-lg bg-white/90 px-2 py-1 text-[11px] font-bold text-gray-900"
                            onClick={(e) => {
                              e.preventDefault()
                              if (card.id === 'pan')
                                setPanDoc({ ...card.doc, quality: 'good' })
                              else
                                setAddrDoc({ ...card.doc, quality: 'good' })
                            }}
                          >
                            Retake
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <ul className="mt-6 space-y-2 rounded-2xl bg-white p-4 text-sm text-gray-700 ring-1 ring-gray-100">
              <li className="flex items-center gap-2 font-medium">
                <span className="text-[#10B981]">✓</span> All text visible
              </li>
              <li className="flex items-center gap-2 font-medium">
                <span className="text-[#10B981]">✓</span> No glare
              </li>
              <li className="flex items-center gap-2 font-medium">
                <span className="text-[#10B981]">✓</span> Corners in frame
              </li>
            </ul>
            {(panDoc?.quality === 'good' || addrDoc?.quality === 'good') && (
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
                  {panDoc?.url && (
                    <img
                      src={panDoc.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-semibold text-gray-900">
                    Upload successful
                  </span>
                  <span className="text-xs text-gray-500">
                    PAN preview stored for this session (mock)
                  </span>
                </div>
                <span className="text-[#10B981] text-xl" aria-hidden>
                  ✓
                </span>
              </div>
            )}
            <button
              type="button"
              disabled={!docsReady}
              className={cn(primaryButtonClasses, 'mt-10')}
              onClick={() => docsReady && setOnboardingStep(5)}
            >
              Continue
            </button>
          </div>
        )
      case 5:
        return (
          <div className="px-4 pb-28 pt-6">
            <h1 className="mb-6 text-xl font-bold text-gray-900">
              Quick selfie to confirm it&apos;s you
            </h1>
            <div className="mx-auto mb-8 flex h-52 w-52 items-center justify-center rounded-full bg-gray-50 selfie-ring-animate ring-[3px] ring-[#4F46E5]">
              <div className="flex h-44 w-44 items-center justify-center rounded-full bg-white shadow-inner">
                <svg
                  className="h-24 w-24 text-gray-200"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            </div>
            <ul className="mb-10 space-y-4">
              {[
                {
                  t: 'Face the camera',
                  icon: '📷',
                },
                {
                  t: 'Remove glasses',
                  icon: '👓',
                },
                {
                  t: 'Stay in good light',
                  icon: '💡',
                },
              ].map((row) => (
                <li
                  key={row.t}
                  className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100"
                >
                  <span className="text-xl" aria-hidden>
                    {row.icon}
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {row.t}
                  </span>
                </li>
              ))}
            </ul>
            {selfiePhase === 'idle' && (
              <button
                type="button"
                className={primaryButtonClasses}
                onClick={() => {
                  setSelfiePhase('processing')
                  setTimeout(() => setSelfiePhase('success'), 1500)
                }}
              >
                Start selfie check
              </button>
            )}
            {selfiePhase === 'processing' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <span className="h-10 w-10 animate-spin rounded-full border-4 border-[#4F46E5] border-t-transparent" />
                <p className="text-sm font-medium text-gray-600">
                  Verifying live presence…
                </p>
              </div>
            )}
            {selfiePhase === 'success' && (
              <div className="rounded-2xl bg-emerald-50 p-6 text-center ring-1 ring-emerald-100">
                <svg
                  className="mx-auto mb-4 h-14 w-14 text-[#10B981]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <p className="text-lg font-bold text-emerald-900">
                  Identity confirmed
                </p>
                <p className="mt-3 text-xs leading-relaxed text-emerald-800/90">
                  Your selfie is never stored — deleted after verification
                </p>
                <button
                  type="button"
                  className={cn(primaryButtonClasses, 'mt-8')}
                  onClick={beginRiskPhase}
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  const renderStatusBody = () => {
    if (statusScenario === 'idle') {
      return (
        <div className="flex flex-col items-center px-6 pb-28 pt-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
            📋
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            Your verification status
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Finish the steps on Home, or pick a demo outcome in Profile to
            preview Status screens.
          </p>
        </div>
      )
    }
    if (statusScenario === 'risk') {
      return (
        <div className="px-4 pb-28 pt-6">
          <h1 className="mb-2 text-xl font-bold text-gray-900">
            Running secure checks
          </h1>
          <p className="mb-6 text-sm text-gray-500">
            Usually done in under 60 seconds
          </p>
          <div className="grid gap-3">{riskSteps.map(renderRiskRow)}</div>
          <p className="mt-8 text-center text-xs text-gray-400">
            Encrypted connection · INDmoney SmartKYC
          </p>
        </div>
      )
    }
    if (statusScenario === 'verified') {
      return (
        <div className="flex flex-col items-center px-4 pb-28 pt-4">
          <div className="relative mb-6 flex h-40 w-40 items-center justify-center">
            <svg viewBox="0 0 120 120" className="h-full w-full text-[#10B981]">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                opacity="0.2"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray="340"
                strokeDashoffset="60"
                strokeLinecap="round"
                className="-rotate-90 origin-center"
                style={{ transformOrigin: '60px 60px' }}
              />
              <path
                d="M40 62 L54 76 L82 46"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {[12, 28, 44, 70, 88].map((x, i) => (
              <span
                key={i}
                className="absolute h-2 w-2 rounded-full bg-[#10B981]/40"
                style={{
                  left: `${x}%`,
                  top: `${15 + i * 12}%`,
                }}
              />
            ))}
          </div>
          <h1 className="text-center text-2xl font-bold text-gray-900">
            You&apos;re all set, Rohan!
          </h1>
          <p className="mt-2 text-center text-sm text-gray-500">
            Your KYC is complete. Start your investment journey.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {['Invest in Mutual Funds', 'Buy US Stocks', 'Open FD'].map(
              (c) => (
                <span
                  key={c}
                  className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-800"
                >
                  {c}
                </span>
              ),
            )}
          </div>
          <button
            type="button"
            className={cn(primaryButtonClasses, 'mt-8')}
            onClick={() => setActiveTab('profile')}
          >
            Go to Dashboard
          </button>
          <div className="mt-8 w-full rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-gray-100">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
              KYC summary
            </p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Name</dt>
                <dd className="font-semibold text-gray-900">{MOCK_USER_NAME}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">PAN</dt>
                <dd className="font-mono font-semibold text-gray-900">
                  {panNormalized.length >= 3
                    ? `${panNormalized.slice(0, 2)}*****${panNormalized.slice(-1)}`
                    : 'AB*****F'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Aadhaar</dt>
                <dd className="font-mono font-semibold text-gray-900">
                  XXXX XXXX {aadhaarDigits.slice(-4).padStart(4, 'X')}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-gray-100 pt-2">
                <dt className="text-gray-500">Status</dt>
                <dd className="font-semibold text-[#10B981]">Verified</dd>
              </div>
            </dl>
          </div>
        </div>
      )
    }
    if (statusScenario === 'manual_review') {
      return (
        <div className="px-4 pb-28 pt-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <svg
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            We&apos;re reviewing your documents
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Our team is verifying your submission. This usually takes 2–4 hours.
          </p>
          <div className="mx-auto mt-8 max-w-xs text-left">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
              <span>Submitted</span>
              <span>Decision</span>
            </div>
            <div className="relative mt-2 flex h-2 items-center rounded-full bg-gray-100">
              <div className="h-2 w-1/3 rounded-l-full bg-[#10B981]" />
              <div className="absolute left-1/3 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F59E0B] ring-4 ring-white animate-pulse" />
              <div className="ml-auto h-2 w-1/3 rounded-r-full bg-gray-200" />
            </div>
            <p className="mt-2 text-center text-[11px] font-medium text-amber-700">
              Under review
            </p>
          </div>
          <p className="mt-8 text-sm text-gray-600">
            You&apos;ll get a notification when it&apos;s done
          </p>
          <button type="button" className={cn(ghostButtonClasses, 'mt-6')}>
            Chat with support
          </button>
          <div className="mt-10 w-full rounded-2xl bg-white text-left shadow-sm ring-1 ring-gray-100">
            {[
              {
                q: 'Why is manual review needed?',
                a: 'Sometimes image quality or data matching needs a human check to stay compliant with KYC norms.',
              },
              {
                q: 'Can I start investing while pending?',
                a: 'Yes — you can invest up to ₹10,000 across products until verification completes.',
              },
            ].map((item, idx) => (
              <div
                key={item.q}
                className={cn(
                  'border-gray-100',
                  idx > 0 && 'border-t',
                )}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-gray-900"
                  onClick={() =>
                    setFaqOpen((f) => (f === idx ? null : idx))
                  }
                >
                  {item.q}
                  <span className="text-gray-400">
                    {faqOpen === idx ? '−' : '+'}
                  </span>
                </button>
                {faqOpen === idx && (
                  <p className="px-4 pb-3 text-xs leading-relaxed text-gray-600">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )
    }
    if (statusScenario === 'rejected') {
      return (
        <div className="pb-28">
          <div className="bg-[#EF4444] px-4 pb-8 pt-10 text-white">
            <h1 className="text-xl font-bold leading-snug">
              We couldn&apos;t verify your documents
            </h1>
            <p className="mt-2 text-sm text-red-50">
              Let&apos;s fix this together — most issues are resolved in one
              retake.
            </p>
          </div>
          <div className="-mt-4 space-y-4 px-4">
            <div className="rounded-2xl bg-amber-50 p-4 text-left ring-1 ring-amber-100">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Reason
              </p>
              <p className="mt-2 text-sm font-semibold text-amber-950">
                PAN photo was blurry and unreadable
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-gray-100">
              <p className="mb-3 text-sm font-bold text-gray-900">
                Step-by-step fix
              </p>
              <ol className="list-decimal space-y-2 pl-4 text-sm text-gray-700">
                <li>Retake your PAN photo in good lighting</li>
                <li>Ensure all 4 corners are visible</li>
                <li>Avoid flash glare on the card surface</li>
              </ol>
            </div>
            <p className="text-center text-xs font-medium text-gray-500">
              You have 2 more attempts before your account is temporarily locked
            </p>
            <button
              type="button"
              className={primaryButtonClasses}
              onClick={() => {
                setActiveTab('home')
                setOnboardingStep(4)
                setStatusScenario('idle')
                setPanDoc(null)
                setAddrDoc(null)
              }}
            >
              Retry now
            </button>
            <button type="button" className={ghostButtonClasses}>
              Contact support
            </button>
          </div>
        </div>
      )
    }
    return null
  }

  const renderAlertsBody = () => (
    <div className="px-4 pb-28 pt-4">
      <div className="rounded-2xl bg-[#F59E0B] px-4 py-4 text-sm font-bold text-gray-900 shadow-sm">
        Your KYC expires in 23 days
      </div>
      <div className="mt-4 rounded-2xl bg-white p-4 text-sm leading-relaxed text-gray-700 shadow-sm ring-1 ring-gray-100">
        As per SEBI norms, periodic re-verification is required to continue
        investing without interruption.
      </div>
      <div className="mt-8">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
          <span>Today</span>
          <span>23 days left</span>
          <span>Expiry</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-2 flex-1 rounded-full bg-[#4F46E5]" />
          <div className="h-2 flex-[2] rounded-full bg-amber-100" />
          <div className="h-2 w-10 rounded-full bg-gray-200" />
        </div>
        <p className="mt-2 text-right text-[11px] text-gray-400">
          Expires 28 May 2026
        </p>
      </div>
      <div className="mt-10 flex flex-col gap-3">
        <button
          type="button"
          className={primaryButtonClasses}
          onClick={() => {
            setActiveTab('home')
            setOnboardingStep(4)
          }}
        >
          Update KYC now
        </button>
        <button
          type="button"
          className={ghostButtonClasses}
          onClick={() => {
            setAlertSnack('We’ll remind you in 7 days (mock).')
            setTimeout(() => setAlertSnack(null), 2500)
          }}
        >
          Remind me in 7 days
        </button>
      </div>
      <div className="mt-10 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-gray-100">
        <p className="text-sm font-bold text-gray-900">Needs re-verification</p>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span className="text-[#F59E0B]">●</span>
            Address proof update
          </li>
          <li className="flex gap-2">
            <span className="text-[#F59E0B]">●</span>
            Selfie re-check
          </li>
        </ul>
      </div>
    </div>
  )

  const renderProfileBody = () => (
    <div className="px-4 pb-32 pt-8">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-[#4F46E5]">
          RM
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">{MOCK_USER_NAME}</p>
          <p className="text-sm text-gray-500">INDmoney investor</p>
        </div>
      </div>
      <div className="mt-10 space-y-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm font-semibold text-gray-900">
            Account &amp; limits
          </p>
          <p className="mt-1 text-xs text-gray-500">Mock profile surface</p>
        </div>
      </div>
      <div className="mt-10 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
          Prototype controls
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Preview Status tab outcomes without redoing the full flow.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            className={ghostButtonClasses}
            onClick={() => {
              setStatusScenario('manual_review')
              setActiveTab('status')
            }}
          >
            Show manual review (Screen 9)
          </button>
          <button
            type="button"
            className={cn(
              ghostButtonClasses,
              'border-red-100 text-[#EF4444]',
            )}
            onClick={() => {
              setStatusScenario('rejected')
              setActiveTab('status')
            }}
          >
            Show rejection (Screen 10)
          </button>
          <button
            type="button"
            className={ghostButtonClasses}
            onClick={() => {
              setStatusScenario('idle')
              setActiveTab('status')
            }}
          >
            Reset status placeholder
          </button>
        </div>
      </div>
    </div>
  )

  const showBack =
    activeTab === 'home' && onboardingStep > 1 && onboardingStep <= 5

  return (
    <div className="min-h-svh bg-[#F9FAFB] flex justify-center">
      <div
        className="relative flex min-h-svh w-full max-w-[390px] flex-col bg-white shadow-xl ring-1 ring-black/5"
      >
        {alertSnack && (
          <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-2 text-xs font-medium text-white shadow-lg">
            {alertSnack}
          </div>
        )}

        {showFlowProgress && (
          <StepProgress current={progressStep} total={TOTAL_FLOW_STEPS} />
        )}

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'home' && renderHomeBody()}
          {activeTab === 'status' && renderStatusBody()}
          {activeTab === 'alerts' && renderAlertsBody()}
          {activeTab === 'profile' && renderProfileBody()}
        </main>

        {showBack && (
          <div className="sticky bottom-[72px] z-10 border-t border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-sm">
            <button
              type="button"
              className="text-sm font-semibold text-[#4F46E5]"
              onClick={() => setOnboardingStep((s) => Math.max(1, s - 1))}
            >
              ← Back
            </button>
          </div>
        )}

        <nav
          className="sticky bottom-0 z-20 border-t border-gray-100 bg-white/95 backdrop-blur-md"
          aria-label="Primary"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        >
          <div className="grid grid-cols-4 gap-1 px-2 pt-2">
            {TABS.map((tab) => {
              const active = activeTab === tab.id
              const icon =
                tab.id === 'home' ? (
                  <IconHome active={active} />
                ) : tab.id === 'status' ? (
                  <IconStatus active={active} />
                ) : tab.id === 'alerts' ? (
                  <IconBell active={active} />
                ) : (
                  <IconUser active={active} />
                )
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold transition-colors',
                    active ? 'text-[#4F46E5]' : 'text-gray-400',
                  )}
                >
                  {icon}
                  {tab.label}
                </button>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
