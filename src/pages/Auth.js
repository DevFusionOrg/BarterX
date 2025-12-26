import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/auth.service";
import "../styles/Auth.css";

function Auth() {
  const navigate = useNavigate();
  const { 
    signInWithEmail, 
    signUpWithEmail, 
    signInWithGoogle, 
    resetPassword,
    loading,
    error,
    setError 
  } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const deriveUsernameFromEmail = (emailStr) => {
    if (!emailStr) return "";
    const local = emailStr.split("@")[0] || "";
    return local.toLowerCase().trim().replace(/[^a-z0-9._-]/g, "").slice(0, 16);
  };

  // Auto-generate username from email
  React.useEffect(() => {
    if (email && !isLogin && !username) {
      const generatedUsername = deriveUsernameFromEmail(email);
      setUsername(generatedUsername);
    }
  }, [email, isLogin, username]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    
    if (isLogin) {
      // Login
      const result = await signInWithEmail(email, password);
      if (result.success) {
        navigate("/");
      }
    } else {
      // Sign up
      if (!fullName.trim()) {
        setError("Full name is required");
        return;
      }
      if (!username.trim()) {
        setError("Username is required");
        return;
      }

      const userData = {
        fullName,
        username
      };

      const result = await signUpWithEmail(email, password, userData);
      if (result.success) {
        navigate("/");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (result.success) {
      navigate("/");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail.trim()) {
      setError("Please enter your email address");
      return;
    }

    const result = await resetPassword(forgotPasswordEmail);
    if (result.success) {
      setResetEmailSent(true);
      setError("");

      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmailSent(false);
        setForgotPasswordEmail("");
      }, 8000);
    }
  };

  const openForgotPasswordModal = () => {
    setShowForgotPassword(true);
    setForgotPasswordEmail(email);
    setError("");
    setResetEmailSent(false);
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail("");
    setError("");
    setResetEmailSent(false);
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setUsername("");
    setError("");
  };

  const toggleAuthMode = () => {
    resetForm();
    setIsLogin((prev) => !prev);
  };

  return (
    <div className="auth-container">
      <div className="auth-top-header">
        <div className="auth-app-name">BarterX</div>
      </div>

      <div className="auth-logo-section">
        <img src="/logo512.png" alt="BarterX Logo" className="auth-logo" />
      </div>

      <div className="auth-card">
        {error && <div className="auth-error">{error}</div>}

        {isLogin ? (
          <>
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to continue trading</p>

            <form onSubmit={handleEmailAuth} className="auth-form">
              <div className="auth-input-group">
                <label className="auth-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="auth-input"
                  required
                  disabled={loading}
                />
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="auth-input"
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="auth-email-button"
                disabled={loading}
              >
                {loading ? (
                  <div className="spinner-small"></div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="auth-forgot-password-container">
              <button
                type="button"
                onClick={openForgotPasswordModal}
                className="auth-forgot-password-link"
                disabled={loading}
              >
                Forgot Password?
              </button>
            </div>

            <div className="auth-divider">
              <span className="auth-divider-text">or</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="auth-google-button"
              disabled={loading}
            >
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google"
                className="auth-google-icon"
              />
              {loading ? "Loading..." : "Sign in with Google"}
            </button>
          </>
        ) : (
          <>
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Join the barter community</p>

            <form onSubmit={handleEmailAuth} className="auth-form">
              <div className="auth-input-group">
                <label className="auth-label">Full Name<span className="auth-required">*</span></label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="auth-input"
                  required
                  disabled={loading}
                />
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Email<span className="auth-required">*</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="auth-input"
                  required
                  disabled={loading}
                />
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Username<span className="auth-required">*</span></label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="auth-input"
                  required
                  disabled={loading}
                />
                <small className="auth-hint">This will be your unique identifier</small>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Password<span className="auth-required">*</span></label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="auth-input"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <small className="auth-hint">Minimum 6 characters</small>
              </div>

              <button
                type="submit"
                className="auth-email-button"
                disabled={loading}
              >
                {loading ? (
                  <div className="spinner-small"></div>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span className="auth-divider-text">or</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="auth-google-button"
              disabled={loading}
            >
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google"
                className="auth-google-icon"
              />
              {loading ? "Loading..." : "Sign up with Google"}
            </button>
          </>
        )}

        <div className="auth-switch-container">
          <button
            type="button"
            onClick={toggleAuthMode}
            className="auth-create-account-button"
            disabled={loading}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>

      <div className="auth-footer">
        <div className="devfusion-logo">
          <span className="devfusion-text">Trade • Exchange • Connect</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="auth-modal-overlay" onClick={closeForgotPasswordModal}>
          <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="auth-modal-close" 
              onClick={closeForgotPasswordModal}
              aria-label="Close"
            >
              ×
            </button>
            
            <h2 className="auth-modal-title">Reset Password</h2>
            
            {resetEmailSent ? (
              <div className="auth-reset-success">
                <div className="auth-success-icon">✓</div>
                <p className="auth-success-message">
                  Password reset email sent successfully!
                </p>
                <p className="auth-success-submessage">
                  Please check your inbox at <strong>{forgotPasswordEmail}</strong>
                </p>
                <p className="auth-spam-notice">
                  ⚠️ Check your spam/junk folder if you don't see the email.
                </p>
                <button 
                  onClick={closeForgotPasswordModal}
                  className="auth-modal-ok-button"
                >
                  OK
                </button>
              </div>
            ) : (
              <>
                <p className="auth-modal-description">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                
                {error && <div className="auth-error">{error}</div>}
                
                <form onSubmit={handleForgotPassword} className="auth-modal-form">
                  <div className="auth-input-group">
                    <label className="auth-label">Email Address</label>
                    <input
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="auth-input"
                      required
                      disabled={loading}
                      autoFocus
                    />
                  </div>

                  <div className="auth-modal-buttons">
                    <button
                      type="button"
                      onClick={closeForgotPasswordModal}
                      className="auth-modal-cancel-button"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="auth-modal-submit-button"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="spinner-small"></div>
                      ) : (
                        "Send Reset Link"
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Auth;