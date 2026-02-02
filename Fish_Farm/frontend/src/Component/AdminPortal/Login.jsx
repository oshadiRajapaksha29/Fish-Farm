import React, { useState } from 'react';
import { Eye, EyeOff, Fish, Mail, Lock, ArrowRight, Facebook, Chrome } from 'lucide-react';
import axios from 'axios';
import {Link, useNavigate} from 'react-router-dom'

export default function DarkFishStoreLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const roles = {
    admin: "/admin",
    customer: "/",
    employee: "/EmployeeLoginPortal"
  }

  const navigate = useNavigate();

// In your login component, after successful authentication
const handleLogin = async() => {
  if (!formData.email || !formData.password) {
    alert('Please fill in all fields');
    return;
  }
  
  setIsLoading(true);
  
  try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData, {withCredentials: true});

      // Store user data in localStorage for easy access
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);
      
      const path = roles[res.data.role];
      if (path) {
          navigate(path);
      } else {
          alert("Invalid role or credentials.");
          setIsLoading(false);
      }
  } catch (e) {
      console.log(e.message);
      alert("Login failed. Try again!");
      setIsLoading(false);
  }
};
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const styles = {
    container: {
      height: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    },
    
    backgroundPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `
        radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(14, 165, 233, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(6, 182, 212, 0.06) 0%, transparent 50%)
      `,
      animation: 'pulse 8s ease-in-out infinite'
    },

    floatingElement: {
      position: 'absolute',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(14, 165, 233, 0.05))',
      animation: 'float 12s ease-in-out infinite',
      backdropFilter: 'blur(1px)'
    },

    fishElement: {
      position: 'absolute',
      fontSize: '1.5rem',
      opacity: 0.15,
      animation: 'swim 15s ease-in-out infinite',
      filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))'
    },

    waveDecor: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '120px',
      background: 'linear-gradient(to top, rgba(59, 130, 246, 0.1) 0%, transparent 100%)',
      clipPath: 'polygon(0 100%, 0 60%, 25% 70%, 50% 50%, 75% 65%, 100% 45%, 100% 100%)',
      animation: 'wave 6s ease-in-out infinite'
    },

    loginContainer: {
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      boxShadow: `
        0 32px 64px -12px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(59, 130, 246, 0.1),
        inset 0 1px 0 rgba(148, 163, 184, 0.1)
      `,
      padding: '2rem',
      width: '100%',
      maxWidth: '400px',
      maxHeight: 'calc(100vh - 2rem)',
      position: 'relative',
      zIndex: 10,
      border: '1px solid rgba(59, 130, 246, 0.2)',
      overflowY: 'auto'
    },

    header: {
      textAlign: 'center',
      marginBottom: '2rem'
    },

    logoContainer: {
      position: 'relative',
      display: 'inline-block',
      marginBottom: '1rem'
    },

    logo: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '3.5rem',
      height: '3.5rem',
      background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
      position: 'relative',
      overflow: 'hidden'
    },

    logoGlow: {
      position: 'absolute',
      top: '-2px',
      left: '-2px',
      right: '-2px',
      bottom: '-2px',
      background: 'linear-gradient(45deg, #3b82f6, #1e40af, #0ea5e9)',
      borderRadius: '18px',
      zIndex: -1,
      animation: 'glow 3s ease-in-out infinite alternate'
    },

    googleTxt: {
      color: 'white',
      textDecoration: 'none',
    },

    title: {
      fontSize: '1.75rem',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #ffffff, #e2e8f0)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      color: 'transparent',
      marginBottom: '0.5rem',
      margin: '0 0 0.5rem 0'
    },

    subtitle: {
      color: '#94a3b8',
      fontSize: '0.875rem',
      fontWeight: '400',
      margin: 0
    },

    formGroup: {
      marginBottom: '1.25rem'
    },

    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#e2e8f0',
      marginBottom: '0.5rem',
      letterSpacing: '0.025em'
    },

    inputWrapper: {
      position: 'relative'
    },

    input: {
      width: '100%',
      padding: '0.875rem 0.875rem 0.875rem 3rem',
      border: '1px solid rgba(71, 85, 105, 0.6)',
      borderRadius: '12px',
      background: 'rgba(30, 41, 59, 0.6)',
      fontSize: '0.9rem',
      color: '#f1f5f9',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      outline: 'none',
      boxSizing: 'border-box',
      placeholder: '#64748b'
    },

    inputFocused: {
      borderColor: '#3b82f6',
      background: 'rgba(30, 41, 59, 0.8)',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15), 0 4px 12px rgba(59, 130, 246, 0.1)',
      transform: 'translateY(-1px)'
    },

    inputIcon: {
      position: 'absolute',
      left: '0.875rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#64748b',
      width: '1.125rem',
      height: '1.125rem',
      transition: 'color 0.3s ease'
    },

    inputIconFocused: {
      color: '#3b82f6'
    },

    passwordToggle: {
      position: 'absolute',
      right: '0.875rem',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: '#64748b',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      padding: '0.25rem',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },

    formOptions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem'
    },

    checkboxWrapper: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      transition: 'opacity 0.2s ease'
    },

    checkbox: {
      width: '1.125rem',
      height: '1.125rem',
      border: '2px solid #475569',
      borderRadius: '4px',
      marginRight: '0.75rem',
      position: 'relative',
      background: 'transparent',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },

    checkboxChecked: {
      background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
      borderColor: '#3b82f6',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
    },

    checkboxLabel: {
      fontSize: '0.875rem',
      color: '#94a3b8',
      userSelect: 'none',
      fontWeight: '400'
    },

    forgotLink: {
      fontSize: '0.875rem',
      color: '#3b82f6',
      textDecoration: 'none',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      fontWeight: '500'
    },

    loginBtn: {
      width: '100%',
      background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '0.875rem 1.25rem',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      letterSpacing: '0.025em'
    },

    loginBtnHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 32px rgba(59, 130, 246, 0.5)',
      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)'
    },

    loginBtnDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
      transform: 'none'
    },

    spinner: {
      width: '1.25rem',
      height: '1.25rem',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginRight: '0.75rem'
    },

    divider: {
      display: 'flex',
      alignItems: 'center',
      margin: '1.5rem 0',
      position: 'relative'
    },

    dividerLine: {
      flex: 1,
      height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(71, 85, 105, 0.4), transparent)'
    },

    dividerText: {
      padding: '0 1.5rem',
      color: '#64748b',
      fontSize: '0.875rem',
      fontWeight: '500',
      background: 'rgba(15, 23, 42, 0.8)',
      borderRadius: '12px',
      border: '1px solid rgba(71, 85, 105, 0.3)'
    },

    socialBtn: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.75rem 1.25rem',
      border: '1px solid rgba(71, 85, 105, 0.4)',
      borderRadius: '12px',
      background: 'rgba(30, 41, 59, 0.4)',
      backdropFilter: 'blur(8px)',
      color: '#e2e8f0',
      textDecoration: 'none',
      fontWeight: '500',
      marginBottom: '0.75rem',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      fontSize: '0.875rem'
    },

    socialIcon: {
      width: '1.125rem',
      height: '1.125rem',
      marginRight: '0.5rem'
    },

    signupLink: {
      textAlign: 'center',
      marginTop: '1.5rem',
      color: '#94a3b8',
      fontSize: '0.875rem'
    },

    signupLinkA: {
      color: '#3b82f6',
      textDecoration: 'none',
      fontWeight: '600',
      transition: 'color 0.3s ease',
      cursor: 'pointer'
    },

    footer: {
      textAlign: 'center',
      marginTop: '1.5rem',
      fontSize: '0.75rem',
      color: '#64748b'
    },

    footerP: {
      marginBottom: '0.25rem',
      margin: '0 0 0.25rem 0'
    }
  };

  const keyframes = `
    @keyframes float {
      0%, 100% { 
        transform: translateY(0px) scale(1); 
        opacity: 0.1; 
      }
      50% { 
        transform: translateY(-30px) scale(1.1); 
        opacity: 0.2; 
      }
    }

    @keyframes swim {
      0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
      25% { transform: translateY(-15px) translateX(10px) rotate(5deg); }
      50% { transform: translateY(20px) translateX(-10px) rotate(-5deg); }
      75% { transform: translateY(-10px) translateX(15px) rotate(3deg); }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes glow {
      0% { opacity: 0.5; transform: scale(1); }
      100% { opacity: 0.8; transform: scale(1.02); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }

    @keyframes wave {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(10px); }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.container}>
        <div style={styles.backgroundPattern} />
        
        {/* Floating elements */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.floatingElement,
              left: `${[10, 80, 60, 20, 90, 5, 75, 35][i]}%`,
              top: `${[20, 10, 70, 60, 50, 80, 30, 85][i]}%`,
              width: `${[40, 60, 30, 50, 35, 45, 25, 55][i]}px`,
              height: `${[40, 60, 30, 50, 35, 45, 25, 55][i]}px`,
              animationDelay: `${i * 1.5}s`
            }}
          />
        ))}

        {/* Swimming fish */}
        <div style={{
          ...styles.fishElement, 
          top: '15%', 
          left: '5%', 
          color: '#3b82f6',
          animationDelay: '0s'
        }}>🐠</div>
        <div style={{
          ...styles.fishElement, 
          top: '25%', 
          right: '8%', 
          color: '#0ea5e9',
          animationDelay: '3s'
        }}>🐟</div>
        <div style={{
          ...styles.fishElement, 
          bottom: '25%', 
          left: '15%', 
          color: '#06b6d4',
          animationDelay: '6s'
        }}>🐡</div>
        <div style={{
          ...styles.fishElement, 
          top: '60%', 
          right: '5%', 
          color: '#1e40af',
          animationDelay: '9s'
        }}>🦈</div>

        <div style={styles.waveDecor} />

        {/* Main login container */}
        <div style={styles.loginContainer}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.logoContainer}>
              <div style={styles.logoGlow} />
              <div style={styles.logo}>
                <Fish style={{width: '1.5rem', height: '1.5rem', color: 'white'}} />
              </div>
            </div>
            <h1 style={styles.title}>Aqua-Peak</h1>
            <p style={styles.subtitle}>Premium tropical fish & aquarium solutions</p>
          </div>

          {/* Login form */}
          <div>
            {/* Email field */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail style={{
                  ...styles.inputIcon,
                  ...(focusedField === 'email' ? styles.inputIconFocused : {})
                }} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  style={{
                    ...styles.input,
                    ...(focusedField === 'email' ? styles.inputFocused : {})
                  }}
                  placeholder="Enter your email address"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                />
              </div>
            </div>

            {/* Password field */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <Lock style={{
                  ...styles.inputIcon,
                  ...(focusedField === 'password' ? styles.inputIconFocused : {})
                }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  style={{
                    ...styles.input,
                    ...(focusedField === 'password' ? styles.inputFocused : {})
                  }}
                  placeholder="Enter your password"
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#3b82f6';
                    e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#64748b';
                    e.target.style.background = 'none';
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div style={styles.formOptions}>
              <div 
                style={styles.checkboxWrapper} 
                onClick={() => handleInputChange('rememberMe', !formData.rememberMe)}
                onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                <div style={{
                  ...styles.checkbox,
                  ...(formData.rememberMe ? styles.checkboxChecked : {})
                }}>
                  {formData.rememberMe && (
                    <span style={{
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>✓</span>
                  )}
                </div>
                <span style={styles.checkboxLabel}>Keep me signed in</span>
              </div>
              <a 
                href="#" 
                style={styles.forgotLink}
                onMouseEnter={(e) => {
                  e.target.style.color = '#2563eb';
                  e.target.style.textShadow = '0 0 8px rgba(59, 130, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#3b82f6';
                  e.target.style.textShadow = 'none';
                }}
              >
                Forgot password?
              </a>
            </div>

            {/* Login button */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              style={{
                ...styles.loginBtn,
                ...(isLoading ? styles.loginBtnDisabled : {})
              }}
              onMouseEnter={(e) => !isLoading && Object.assign(e.target.style, styles.loginBtnHover)}
              onMouseLeave={(e) => !isLoading && (e.target.style.transform = 'translateY(0px)', e.target.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.4)', e.target.style.background = 'linear-gradient(135deg, #3b82f6, #1e40af)')}
            >
              {isLoading ? (
                <>
                  <div style={styles.spinner}></div>
                  <span>Signing you in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight style={{marginLeft: '0.5rem', width: '1rem', height: '1rem'}} />
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div style={styles.divider}>
            <div style={styles.dividerLine}></div>
            <span style={styles.dividerText}>or continue with</span>
            <div style={styles.dividerLine}></div>
          </div>

          {/* Social login */}
          <div>
            <button 
              style={styles.socialBtn}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(30, 41, 59, 0.6)';
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(30, 41, 59, 0.4)';
                e.target.style.borderColor = 'rgba(71, 85, 105, 0.4)';
                e.target.style.transform = 'translateY(0px)';
              }}
            >
              <Facebook style={{...styles.socialIcon, color: '#1877f2'}} />
              <span>Continue with Facebook</span>
            </button>
            <button 
              style={styles.socialBtn}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(30, 41, 59, 0.6)';
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(30, 41, 59, 0.4)';
                e.target.style.borderColor = 'rgba(71, 85, 105, 0.4)';
                e.target.style.transform = 'translateY(0px)';
              }}
            >
              <Chrome style={{...styles.socialIcon, color: '#ea4335'}} />
              <Link style={styles.googleTxt} to='http://localhost:5000/auth/google'>Continue with Google</Link>
            </button>
          </div>

          {/* Sign up link */}
          <div style={styles.signupLink}>
            <p style={{margin: 0}}>
              New to Aqua-Peak? {''}
              <a 
                href="/Register" 
                style={styles.signupLinkA}
                onMouseEnter={(e) => {
                  e.target.style.color = '#2563eb';
                  e.target.style.textShadow = '0 0 8px rgba(59, 130, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#3b82f6';
                  e.target.style.textShadow = 'none';
                }}
              >
                Create your account
              </a>
            </p>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <p style={styles.footerP}>© 2025 Aqua-Peak. All rights reserved.</p>
            <p style={styles.footerP}>Fish Farm Management System — trusted by pros worldwide.</p>
          </div>
        </div>
      </div>
    </>
  );
}