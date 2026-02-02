import React from 'react'
import { useState } from 'react'
import { ArrowLeft, CheckCircle, XCircle, Mail, Lock, Eye, EyeOff } from 'lucide-react'

const styles = `
  .forgot-password-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-color: #f9fafb;
    padding: 1rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .form-card {
    width: 100%;
    max-width: 28rem;
    background-color: white;
    border-radius: 0.75rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    padding: 2rem;
    height: 500px;
    overflow-y: auto;
  }

  .logo-container {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
  }

  .logo-circle {
    height: 3rem;
    width: 3rem;
    border-radius: 50%;
    background-color: #f0fdf4;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .main-title {
    font-size: 1.5rem;
    font-weight: bold;
    text-align: center;
    margin-bottom: 0.5rem;
    color: #1f2937;
  }

  .subtitle {
    text-align: center;
    color: #6b7280;
    margin-bottom: 1.5rem;
  }

  .progress-container {
    margin-bottom: 2rem;
  }

  .progress-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
  }

  .progress-line-bg {
    position: absolute;
    top: 1rem;
    left: 0;
    right: 0;
    height: 0.125rem;
    background-color: #e5e7eb;
    z-index: -10;
  }

  .progress-line-active {
    position: absolute;
    top: 1rem;
    left: 0;
    height: 0.125rem;
    background-color: #00b074;
    z-index: -10;
    transition: width 0.3s ease;
  }

  .step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 10;
  }

  .step-circle {
    height: 2rem;
    width: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
    background-color: #e5e7eb;
  }

  .step-circle.active {
    background-color: #00b074;
    color: white;
  }

  .step-label {
    font-size: 0.75rem;
    margin-top: 0.25rem;
    color: #6b7280;
  }

  .message-success {
    margin-bottom: 1.5rem;
    padding: 0.75rem;
    background-color: #f0fdf4;
    color: #15803d;
    border-radius: 0.5rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .back-button {
    display: flex;
    align-items: center;
    color: #6b7280;
    background: none;
    border: none;
    cursor: pointer;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  .back-button:hover {
    color: #00b074;
  }

  .form-space {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
  }

  .input-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.25rem;
  }

  .input-wrapper {
    position: relative;
  }

  .input-icon {
    position: absolute;
    top: 50%;
    left: 0.75rem;
    transform: translateY(-50%);
    pointer-events: none;
    color: #9ca3af;
  }

  .input-field {
    width: 100%;
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    outline: none;
    font-size: 1rem;
    box-sizing: border-box;
  }

  .input-field:focus {
    border-color: #00b074;
    box-shadow: 0 0 0 3px rgba(0, 176, 116, 0.1);
  }

  .input-field.error {
    border-color: #f87171;
  }

  .input-field-with-toggle {
    padding-right: 2.5rem;
  }

  .toggle-button {
    position: absolute;
    top: 50%;
    right: 0.75rem;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #9ca3af;
  }

  .error-message {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #dc2626;
    display: flex;
    align-items: center;
  }

  .submit-button {
    width: 100%;
    background-color: #00b074;
    color: white;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }

  .submit-button:hover:not(:disabled) {
    background-color: #059669;
  }

  .submit-button:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 176, 116, 0.3);
  }

  .submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .loading-content {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .spinner {
    animation: spin 1s linear infinite;
    margin-right: 0.5rem;
    height: 1rem;
    width: 1rem;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* OTP specific styles */
  .otp-title {
    font-size: 1.125rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  .otp-description {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 1rem;
  }

  .otp-inputs {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .otp-input {
    width: 3rem;
    height: 3.5rem;
    text-align: center;
    font-size: 1.25rem;
    font-weight: 600;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    outline: none;
  }

  .otp-input:focus {
    border-color: #00b074;
    box-shadow: 0 0 0 3px rgba(0, 176, 116, 0.1);
  }

  .resend-section {
    text-align: center;
  }

  .resend-text {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .resend-button {
    background: none;
    border: none;
    font-weight: 500;
    cursor: pointer;
    color: #00b074;
  }

  .resend-button:hover:not(:disabled) {
    color: #059669;
  }

  .resend-button:disabled {
    color: #9ca3af;
    cursor: not-allowed;
  }

  /* Password requirements styles */
  .requirements-box {
    background-color: #f9fafb;
    border-radius: 0.5rem;
    padding: 1rem;
  }

  .requirements-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.75rem;
  }

  .requirements-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .requirement-item {
    display: flex;
    align-items: center;
  }

  .requirement-text {
    font-size: 0.875rem;
  }

  .requirement-text.valid {
    color: #059669;
  }

  .requirement-text.invalid {
    color: #dc2626;
  }

  .toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 9999;
  }

  .toast {
    background-color: white;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    border-left: 4px solid;
    max-width: 20rem;
  }

  .toast.success {
    border-left-color: #10b981;
    color: #065f46;
  }

  .toast.error {
    border-left-color: #ef4444;
    color: #991b1b;
  }
`;

// Toast notification system
const ToastContainer = ({ toasts }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1)
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [message, setMessage] = useState('')
    const [toasts, setToasts] = useState([])

    const addToast = (message, type = 'success') => {
        const id = Date.now()
        const newToast = { id, message, type }
        setToasts(prev => [...prev, newToast])
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id))
        }, 5000)
    }

    const handleEmailSubmit = async (submittedEmail) => {
        try {
            // Simulate API call
            console.log('Sending OTP to:', submittedEmail)
            setEmail(submittedEmail)
            setStep(2)
            setMessage(`OTP sent to ${submittedEmail}`)
            addToast('OTP sent successfully!')
        } catch (error) {
            addToast('Failed to send OTP', 'error')
        }
    }

    const handleOtpSubmit = async (submittedOtp) => {
        try {
            // Simulate API call
            const otpString = submittedOtp.join('')
            console.log('Validating OTP:', otpString)
            setOtp(submittedOtp)
            setStep(3)
            setMessage('')
            addToast('OTP verified successfully!')
        } catch (error) {
            addToast('Invalid OTP', 'error')
        }
    }

    const handlePasswordReset = async (newPassword) => {
        try {
            // Simulate API call
            console.log('Resetting password for:', email)
            addToast('Password reset successfully!')
            setTimeout(() => {
                console.log('Navigate to login page')
            }, 2000)
        } catch (error) {
            addToast('Failed to reset password', 'error')
        }
    }

    const goBack = () => {
        if (step > 1) {
            setStep(step - 1)
        }
    }

    const steps = [
        { id: 1, name: 'Email' },
        { id: 2, name: 'Verification' },
        { id: 3, name: 'New Password' }
    ]

    const getProgressWidth = () => {
        if (step === 1) return '0%'
        if (step === 2) return '50%'
        return '100%'
    }

    return (
        <>
            <style>{styles}</style>
            <div className="forgot-password-container">
                <ToastContainer toasts={toasts} />
                <div className="form-card">
                    <div className="logo-container">
                        <div className="logo-circle">
                            <Lock size={24} color="#00b074" />
                        </div>
                    </div>

                    <h1 className="main-title">Reset Your Password</h1>
                    <p className="subtitle">Follow the steps to recover your account</p>

                    <div className="progress-container">
                        <div className="progress-wrapper">
                            <div className="progress-line-bg"></div>
                            <div 
                                className="progress-line-active" 
                                style={{ width: getProgressWidth() }}
                            ></div>

                            {steps.map((s) => (
                                <div key={s.id} className="step-item">
                                    <div className={`step-circle ${step >= s.id ? 'active' : ''}`}>
                                        {s.id}
                                    </div>
                                    <div className="step-label">{s.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {message && (
                        <div className="message-success">
                            <CheckCircle size={20} style={{ marginRight: '0.5rem' }} />
                            {message}
                        </div>
                    )}

                    {step > 1 && (
                        <button onClick={goBack} className="back-button">
                            <ArrowLeft size={16} style={{ marginRight: '0.25rem' }} /> Back
                        </button>
                    )}

                    {step === 1 && <GetEmail onSubmit={handleEmailSubmit} />}
                    {step === 2 && <GetOTP onSubmit={handleOtpSubmit} email={email} addToast={addToast} />}
                    {step === 3 && <ResetPassword onSubmit={handlePasswordReset} email={email} />}
                </div>
            </div>
        </>
    )
}

function GetEmail({ onSubmit }) {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!email) {
            setError('Email is required')
            return
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address')
            return
        }

        setLoading(true)
        try {
            await onSubmit(email)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="form-space">
            <div className="input-group">
                <label htmlFor="email" className="input-label">
                    Email Address
                </label>
                <div className="input-wrapper">
                    <div className="input-icon">
                        <Mail size={20} />
                    </div>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`input-field ${error ? 'error' : ''}`}
                        placeholder="Enter your email"
                    />
                </div>
                {error && (
                    <p className="error-message">
                        <XCircle size={16} style={{ marginRight: '0.25rem' }} /> {error}
                    </p>
                )}
            </div>
            <button type="submit" disabled={loading} className="submit-button">
                {loading ? (
                    <span className="loading-content">
                        <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </span>
                ) : (
                    "Continue"
                )}
            </button>
        </form>
    )
}

function GetOTP({ onSubmit, email, addToast }) {
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', ''])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [timer, setTimer] = useState(30)
    const [canResend, setCanResend] = useState(false)

    const inputRefs = Array(6).fill(0).map(() => React.createRef())

    React.useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        setCanResend(true)
                        clearInterval(interval)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [timer])

    const handleChange = (index, value) => {
        if (value && !/^\d+$/.test(value)) return

        const newOtpValues = [...otpValues]
        newOtpValues[index] = value
        setOtpValues(newOtpValues)

        if (value && index < 5) {
            inputRefs[index + 1].current.focus()
        }
    }

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (!otpValues[index] && index > 0) {
                const newOtpValues = [...otpValues]
                newOtpValues[index - 1] = ''
                setOtpValues(newOtpValues)
                inputRefs[index - 1].current.focus()
            }
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text')
        if (!/^\d+$/.test(pastedData)) return

        const digits = pastedData.slice(0, 6).split('')
        const newOtpValues = [...otpValues]

        digits.forEach((digit, index) => {
            if (index < 6) {
                newOtpValues[index] = digit
            }
        })

        setOtpValues(newOtpValues)

        const nextEmptyIndex = newOtpValues.findIndex(val => val === '')
        if (nextEmptyIndex !== -1) {
            inputRefs[nextEmptyIndex].current.focus()
        } else {
            inputRefs[5].current.focus()
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (otpValues.some(val => val === '')) {
            setError('Please enter the complete 6-digit OTP')
            return
        }

        setLoading(true)
        try {
            await onSubmit(otpValues)
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        if (!canResend) return
        try {
            console.log('Resending OTP to:', email)
            setTimer(30)
            setCanResend(false)
            addToast('OTP resent successfully!')
        } catch (error) {
            addToast('Failed to resend OTP', 'error')
        }
    }

    const maskedEmail = email.replace(/(.{3})(.*)(?=@)/, '$1***')

    return (
        <form onSubmit={handleSubmit} className="form-space">
            <div className="input-group">
                <h2 className="otp-title">Verification Code</h2>
                <p className="otp-description">
                    We've sent a 6-digit code to {maskedEmail} <span>Check your spam folder also</span>
                </p>

                <div className="otp-inputs">
                    {otpValues.map((value, index) => (
                        <input
                            key={index}
                            ref={inputRefs[index]}
                            type="text"
                            maxLength={1}
                            value={value}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={index === 0 ? handlePaste : undefined}
                            className="otp-input"
                        />
                    ))}
                </div>

                {error && (
                    <p className="error-message">
                        <XCircle size={16} style={{ marginRight: '0.25rem' }} /> {error}
                    </p>
                )}
            </div>

            <button type="submit" disabled={loading} className="submit-button">
                {loading ? (
                    <span className="loading-content">
                        <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                    </span>
                ) : (
                    "Verify & Continue"
                )}
            </button>

            <div className="resend-section">
                <p className="resend-text">
                    Didn't receive the code?{' '}
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={!canResend}
                        className="resend-button"
                    >
                        {canResend ? 'Resend code' : `Resend in ${timer}s`}
                    </button>
                </p>
            </div>
        </form>
    )
}

function ResetPassword({ onSubmit, email }) {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const validatePassword = (value) => {
        const newErrors = {}

        if (value.length < 8) {
            newErrors.length = 'Password must be at least 8 characters'
        }

        if (!/[A-Z]/.test(value)) {
            newErrors.uppercase = 'Password must contain at least one uppercase letter'
        }

        if (!/[a-z]/.test(value)) {
            newErrors.lowercase = 'Password must contain at least one lowercase letter'
        }

        if (!/\d/.test(value)) {
            newErrors.number = 'Password must contain at least one number'
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
            newErrors.special = 'Password must contain at least one special character'
        }

        return newErrors
    }

    const handlePasswordChange = (e) => {
        const value = e.target.value
        setPassword(value)
        setErrors(validatePassword(value))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const validationErrors = validatePassword(password)

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        if (password !== confirmPassword) {
            setErrors({ ...validationErrors, match: 'Passwords do not match' })
            return
        }

        setLoading(true)
        try {
            await onSubmit(password)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="form-space">
            <div className="input-group">
                <label htmlFor="password" className="input-label">
                    New Password
                </label>
                <div className="input-wrapper">
                    <div className="input-icon">
                        <Lock size={20} />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={handlePasswordChange}
                        className="input-field input-field-with-toggle"
                        placeholder="Create new password"
                    />
                    <button
                        type="button"
                        className="toggle-button"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
            </div>

            <div className="input-group">
                <label htmlFor="confirmPassword" className="input-label">
                    Confirm Password
                </label>
                <div className="input-wrapper">
                    <div className="input-icon">
                        <Lock size={20} />
                    </div>
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input-field input-field-with-toggle"
                        placeholder="Confirm your password"
                    />
                    <button
                        type="button"
                        className="toggle-button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                {errors.match && (
                    <p className="error-message">
                        <XCircle size={16} style={{ marginRight: '0.25rem' }} /> {errors.match}
                    </p>
                )}
            </div>

            <div className="requirements-box">
                <h3 className="requirements-title">Password Requirements:</h3>
                <div className="requirements-list">
                    <div className="requirement-item">
                        {errors.length ? (
                            <XCircle size={16} color="#dc2626" style={{ marginRight: '0.5rem' }} />
                        ) : (
                            <CheckCircle size={16} color="#10b981" style={{ marginRight: '0.5rem' }} />
                        )}
                        <span className={`requirement-text ${errors.length ? 'invalid' : 'valid'}`}>
                            At least 8 characters
                        </span>
                    </div>
                    <div className="requirement-item">
                        {errors.uppercase ? (
                            <XCircle size={16} color="#dc2626" style={{ marginRight: '0.5rem' }} />
                        ) : (
                            <CheckCircle size={16} color="#10b981" style={{ marginRight: '0.5rem' }} />
                        )}
                        <span className={`requirement-text ${errors.uppercase ? 'invalid' : 'valid'}`}>
                            One uppercase letter
                        </span>
                    </div>
                    <div className="requirement-item">
                        {errors.lowercase ? (
                            <XCircle size={16} color="#dc2626" style={{ marginRight: '0.5rem' }} />
                        ) : (
                            <CheckCircle size={16} color="#10b981" style={{ marginRight: '0.5rem' }} />
                        )}
                        <span className={`requirement-text ${errors.lowercase ? 'invalid' : 'valid'}`}>
                            One lowercase letter
                        </span>
                    </div>
                    <div className="requirement-item">
                        {errors.number ? (
                            <XCircle size={16} color="#dc2626" style={{ marginRight: '0.5rem' }} />
                        ) : (
                            <CheckCircle size={16} color="#10b981" style={{ marginRight: '0.5rem' }} />
                        )}
                        <span className={`requirement-text ${errors.number ? 'invalid' : 'valid'}`}>
                            One number
                        </span>
                    </div>
                    <div className="requirement-item">
                        {errors.special ? (
                            <XCircle size={16} color="#dc2626" style={{ marginRight: '0.5rem' }} />
                        ) : (
                            <CheckCircle size={16} color="#10b981" style={{ marginRight: '0.5rem' }} />
                        )}
                        <span className={`requirement-text ${errors.special ? 'invalid' : 'valid'}`}>
                            One special character
                        </span>
                    </div>
                </div>
            </div>

            <button type="submit" disabled={loading} className="submit-button">
                {loading ? (
                    <span className="loading-content">
                        <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Resetting...
                    </span>
                ) : (
                    "Reset Password"
                )}
            </button>
        </form>
    )
}