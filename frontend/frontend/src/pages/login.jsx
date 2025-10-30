import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Input,
  Checkbox,
  Toast,
  SpinLoading,
  AutoCenter,
  Grid,
} from "antd-mobile";
import { sendOtp, verifyOtp } from "../services/auth";

const roles = ["buyer", "seller", "owner", "investor", "agent", "consultant"];

export default function Login({ onLoginSuccess }) {
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [selectedRole, setSelectedRole] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);
  const [isMobile, setIsMobile] = useState(false);

  /* ----------------------- Handle Responsive & Zoom ----------------------- */
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Prevent zoom on mobile
    const preventZoom = (e) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    const preventDoubleTapZoom = (() => {
      let lastTouchEnd = 0;
      return (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) e.preventDefault();
        lastTouchEnd = now;
      };
    })();

    document.addEventListener("touchstart", preventZoom, { passive: false });
    document.addEventListener("touchend", preventDoubleTapZoom, { passive: false });

    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport)
      viewport.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      );

    return () => {
      window.removeEventListener("resize", checkMobile);
      document.removeEventListener("touchstart", preventZoom);
      document.removeEventListener("touchend", preventDoubleTapZoom);
    };
  }, []);

  /* ----------------------- Handle OTP Input ----------------------- */
  const handleOtpChange = async (val, index) => {
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otpDigits];
    newOtp[index] = val;
    setOtpDigits(newOtp);

    // Move focus to next input
    if (val && index < 3) otpRefs.current[index + 1]?.focus();

    // Auto verify when all 4 digits are entered
    if (newOtp.every((d) => d !== "")) {
      const otp = newOtp.join("");
      handleVerifyOtp(otp);
    }
  };

  /* ----------------------- Handle OTP KeyDown ----------------------- */
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otpDigits];
      if (!newOtp[index] && index > 0) {
        newOtp[index - 1] = "";
        setOtpDigits(newOtp);
        otpRefs.current[index - 1]?.focus();
      } else if (newOtp[index]) {
        newOtp[index] = "";
        setOtpDigits(newOtp);
      }
    }
    if (e.key === "ArrowLeft" && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 3) otpRefs.current[index + 1]?.focus();
  };

  /* ----------------------- Send OTP ----------------------- */
  const handleSendOtp = async () => {
    if (!phone || !selectedRole || !agreed) {
      Toast.show({
        content: "Please enter phone, select role, and agree to terms.",
        icon: "fail",
      });
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      Toast.show({ content: "Enter a valid 10-digit Indian number.", icon: "fail" });
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(phone, selectedRole);
      if (res.success && res.data.success) {
        Toast.show({ content: res.data.message || "OTP sent successfully!" });
        setStep("otp");
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else throw new Error(res.error);
    } catch (err) {
      console.error(err);
      Toast.show({ content: "Failed to send OTP", icon: "fail" });
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------- Resend OTP ----------------------- */
  const handleResendOtp = async () => {
    if (!phone) {
      Toast.show({ content: "Please enter a valid phone number.", icon: "fail" });
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(phone, selectedRole);
      if (res.success && res.data.success) {
        Toast.show({ content: res.data.message || "OTP resent successfully!" });
        setOtpDigits(["", "", "", ""]);
        otpRefs.current[0]?.focus();
      } else throw new Error(res.error);
    } catch (err) {
      console.error(err);
      Toast.show({ content: "Failed to resend OTP", icon: "fail" });
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------- Verify OTP ----------------------- */
  const handleVerifyOtp = async (otp) => {
    setLoading(true);
    try {
      const res = await verifyOtp(phone, otp, selectedRole);
      if (res.success && res.data.success) {
        localStorage.setItem("authToken", res.data.accessToken);
        Toast.show({ content: res.data.message || "Login successful!" });
        onLoginSuccess(res.data.user);
      } else throw new Error(res.error);
    } catch (err) {
      console.error(err);
      setOtpDigits(["", "", "", ""]);
      otpRefs.current[0]?.focus();
      Toast.show({ content: "Invalid OTP. Try again.", icon: "fail" });
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------- Handle Paste OTP ----------------------- */
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 4);
    if (/^\d{4}$/.test(pasteData)) {
      const newOtp = pasteData.split("");
      setOtpDigits(newOtp);
      setTimeout(() => handleVerifyOtp(pasteData), 100);
    }
  };

  /* ----------------------- UI ----------------------- */
  return (
    <div style={styles.container}>
      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingContent}>
            <SpinLoading color="primary" style={{ "--size": "48px" }} />
            <AutoCenter style={{ marginTop: 16, color: "#1677ff", fontWeight: 500 }}>
              Processing...
            </AutoCenter>
          </div>
        </div>
      )}

      <div style={styles.card}>
        {step === "phone" ? (
          <>
            <div style={styles.header}>
              <div style={styles.logo}>🚀</div>
              <h2 style={styles.title}>Welcome to PropertEase</h2>
              <p style={styles.subtitle}>Enter your details to get started</p>
            </div>

            <div style={styles.formContainer}>
              {/* Mobile Number */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Mobile Number</label>
                <div style={styles.phoneInputContainer}>
                  <div style={styles.countryCode}>+91</div>
                  <Input
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    type="tel"
                    value={phone}
                    onChange={(val) => setPhone(val.replace(/\D/g, ""))}
                    clearable
                    style={styles.phoneInput}
                    inputMode="numeric"
                  />
                </div>
              </div>

              {/* Roles */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Select Your Role</label>
                <Grid columns={2} gap={8}>
                  {roles.map((role) => (
                    <Grid.Item key={role}>
                      <Button
                        block
                        color={selectedRole === role ? "primary" : "default"}
                        size="middle"
                        style={{
                          ...styles.roleButton,
                          ...(selectedRole === role ? styles.roleButtonActive : {}),
                        }}
                        onClick={() => setSelectedRole(role)}
                      >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Button>
                    </Grid.Item>
                  ))}
                </Grid>
              </div>

              {/* Terms */}
              <div style={styles.termsContainer}>
                <Checkbox checked={agreed} onChange={setAgreed} style={styles.checkbox}>
                  <span style={styles.checkboxText}>
                    I agree to the{" "}
                    <a href="#" style={styles.link}>
                      Terms & Conditions
                    </a>{" "}
                    and{" "}
                    <a href="#" style={styles.link}>
                      Privacy Policy
                    </a>
                  </span>
                </Checkbox>
              </div>

              {/* Send OTP */}
              <Button
                block
                color="primary"
                size="large"
                style={styles.sendButton}
                onClick={handleSendOtp}
                disabled={!phone || !selectedRole || !agreed}
              >
                Send OTP
              </Button>
            </div>
          </>
        ) : (
          <>
            <div style={styles.header}>
              <div style={styles.logo}>🔐</div>
              <h2 style={styles.title}>Verify OTP</h2>
              <p style={styles.subtitle}>
                Sent to +91 {phone}{" "}
                <span
                  style={styles.changeLink}
                  onClick={() => {
                    setStep("phone");
                    setOtpDigits(["", "", "", ""]);
                  }}
                >
                  Change
                </span>
              </p>
            </div>

            {/* OTP Input Section */}
            <div style={styles.otpSection}>
              <div style={styles.otpContainer} onPaste={handlePaste}>
                {otpDigits.map((d, i) => (
                  <Input
                    key={i}
                    maxLength={1}
                    value={d}
                    onChange={(val) => handleOtpChange(val, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="tel"
                    inputMode="numeric"
                    style={styles.otpInput}
                    disabled={loading}
                  />
                ))}
              </div>

              <p style={styles.otpHint}>Enter the 4-digit OTP to verify</p>

              <div style={styles.resend}>
                <span style={styles.resendText}>Didn’t receive OTP?</span>
                <Button
                  size="small"
                  color="primary"
                  fill="none"
                  onClick={handleResendOtp}
                  disabled={loading}
                  style={styles.resendButton}
                >
                  Resend OTP
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ✅ Keep all your styles from previous version (no dummyOtpBox) */


/* -------------------------- PERFECT STYLES -------------------------- */
const styles = {
  container: {
    width: "100%",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    // Prevent zoom on mobile
    touchAction: "manipulation",
    WebkitTouchCallout: "none",
    WebkitUserSelect: "none",
    KhtmlUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none",
    userSelect: "none",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    minHeight: "500px",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "24px 20px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "center",
    marginBottom: "28px",
  },
  logo: {
    fontSize: "44px",
    marginBottom: "16px",
  },
  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
    color: "#1a202c",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: "8px",
    lineHeight: "1.3",
  },
  subtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#718096",
    fontWeight: "400",
    lineHeight: "1.4",
  },
  // ✅ New styles for dummy OTP display
  dummyOtpContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "16px",
    width: "100%",
  },
  dummyOtpBox: {
    background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
    padding: "12px 20px",
    borderRadius: "12px",
    border: "2px solid #ffd700",
    boxShadow: "0 4px 12px rgba(255, 107, 107, 0.3)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  dummyOtpLabel: {
    fontSize: "12px",
    color: "white",
    fontWeight: "500",
    opacity: 0.9,
  },
  dummyOtpCode: {
    fontSize: "20px",
    color: "white",
    fontWeight: "700",
    letterSpacing: "2px",
    fontFamily: "'Courier New', monospace",
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  inputLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: "2px",
  },
  phoneInputContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  countryCode: {
    position: "absolute",
    left: "12px",
    zIndex: 2,
    fontSize: "15px",
    fontWeight: "500",
    color: "#4a5568",
    background: "#f7fafc",
    padding: "6px 8px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  phoneInput: {
    borderRadius: "14px",
    background: "#fff",
    border: "2px solid #e2e8f0",
    transition: "all 0.2s ease",
    fontSize: "16px",
    height: "48px",
    paddingLeft: "70px",
    width: "100%",
  },
  roleButton: {
    borderRadius: "14px",
    fontSize: "13px",
    fontWeight: "500",
    height: "42px",
    border: "2px solid #e2e8f0",
    background: "#fff",
    transition: "all 0.2s ease",
  },
  roleButtonActive: {
    border: "2px solid #1677ff",
    background: "#1677ff",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(22, 119, 255, 0.3)",
  },
  termsContainer: {
    marginTop: "4px",
  },
  checkbox: {
    alignItems: "flex-start",
    "--icon-size": "18px",
    "--font-size": "14px",
  },
  checkboxText: {
    fontSize: "13px",
    color: "#4a5568",
    lineHeight: "1.4",
  },
  link: {
    color: "#1677ff",
    textDecoration: "none",
    fontWeight: "500",
  },
  sendButton: {
    borderRadius: "14px",
    height: "50px",
    fontSize: "16px",
    fontWeight: "600",
    background: "linear-gradient(135deg, #1677ff 0%, #722ed1 100%)",
    border: "none",
    marginTop: "8px",
    boxShadow: "0 4px 12px rgba(22, 119, 255, 0.3)",
  },
  otpSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  otpContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    margin: "20px 0",
    width: "100%",
  },
  otpInput: {
    width: "55px",
    height: "55px",
    textAlign: "center",
    fontSize: "20px",
    fontWeight: "600",
    borderRadius: "14px",
    border: "2px solid #e2e8f0",
    background: "#fff",
    transition: "all 0.2s ease",
    flex: "1",
    maxWidth: "55px",
  },
  otpHint: {
    textAlign: "center",
    fontSize: "13px",
    color: "#718096",
    marginBottom: "20px",
    lineHeight: "1.4",
  },
  resend: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    flexWrap: "wrap",
  },
  resendText: {
    fontSize: "14px",
    color: "#718096",
  },
  resendButton: {
    fontSize: "14px",
    fontWeight: "500",
  },
  changeLink: {
    color: "#1677ff",
    marginLeft: "6px",
    fontWeight: "500",
    textDecoration: "none",
    cursor: "pointer",
  },
  loadingOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(255, 255, 255, 0.92)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    backdropFilter: "blur(8px)",
  },
  loadingContent: {
    background: "rgba(255, 255, 255, 0.95)",
    padding: "28px",
    borderRadius: "18px",
    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
};