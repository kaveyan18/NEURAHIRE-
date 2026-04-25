import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { AuthContext } from '../context/AuthContext';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PremiumModal({ isOpen, onClose }) {
  const { token, user, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15,14,28,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--surface-card)',
            width: '100%',
            maxWidth: 800,
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid var(--surface-border2)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '32px 40px',
            background: 'linear-gradient(135deg, rgba(124,111,247,0.1), rgba(168,154,249,0.05))',
            borderBottom: '1px solid var(--surface-border)',
            position: 'relative'
          }}>
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: 24, right: 24,
                background: 'rgba(0,0,0,0.05)', border: 'none',
                width: 32, height: 32, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'background 0.2s',
                color: 'var(--text-secondary)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
            >
              <XMarkIcon style={{ width: 18, height: 18 }} />
            </button>

            <h2 className="nh-font-display" style={{ fontSize: 28, color: 'var(--text-primary)', marginBottom: 8 }}>
              Unlock <span className="gradient-text">Premium Features</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 500 }}>
              You've run out of free credits. Upgrade to continue receiving deep AI resume analysis and exclusive career tools.
            </p>
          </div>

          {/* Pricing Content */}
          <div style={{ padding: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
            
            {/* Free Plan (Current) */}
            <div style={{
              padding: 24,
              borderRadius: 16,
              border: '1px solid var(--surface-border)',
              background: 'var(--surface-bg)',
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Starter</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>Your current plan</p>
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>
                Free
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['2 Free Analyses', 'Basic Match Scoring', 'Keyword Tracking'].map(feature => (
                  <li key={feature} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
                    <CheckCircleIcon style={{ width: 18, height: 18, color: 'var(--text-muted)' }} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Premium Plan */}
            <div style={{
              padding: 24,
              borderRadius: 16,
              border: '2px solid var(--purple)',
              background: 'linear-gradient(180deg, rgba(124,111,247,0.05) 0%, transparent 100%)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute', top: -12, right: 24,
                background: 'var(--purple)', color: '#fff',
                fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
                padding: '4px 10px', borderRadius: 100
              }}>Recommended</div>

              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--purple)', marginBottom: 4 }}>Pro Credits</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>For active job seekers</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>₹499</span>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/ 50 Credits</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['50 Deep AI Analyses', 'Detailed ATS Suggestions', 'Cover Letter Generation (Soon)', 'Priority Support'].map(feature => (
                  <li key={feature} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-primary)' }}>
                    <CheckCircleIcon style={{ width: 18, height: 18, color: 'var(--purple)' }} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                disabled={loading}
                style={{
                  width: '100%',
                  marginTop: 32,
                  background: loading ? 'var(--purple-dim)' : 'var(--purple)',
                  color: loading ? 'var(--text-muted)' : '#fff',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s, transform 0.1s',
                  boxShadow: loading ? 'none' : '0 4px 12px rgba(124,111,247,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
                onMouseEnter={e => { if(!loading) { e.currentTarget.style.background = 'var(--purple-dark)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                onMouseLeave={e => { if(!loading) { e.currentTarget.style.background = 'var(--purple)'; e.currentTarget.style.transform = 'none'; } }}
                onClick={async () => {
                  setLoading(true);
                  const res = await loadRazorpayScript();
                  if (!res) {
                    alert('Razorpay SDK failed to load. Are you online?');
                    setLoading(false);
                    return;
                  }

                  try {
                    // 1. Create order on backend
                    const orderRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/payments/create-order`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify({ amount: 499, credits: 50 }) // 499 INR for 50 credits
                    });
                    const orderData = await orderRes.json();
                    
                    if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

                    // 2. Initialize Razorpay options
                    const options = {
                      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_ShCyoxWtt27Nq5', 
                      amount: orderData.amount,
                      currency: orderData.currency,
                      name: 'NeuraHire',
                      description: 'Pro Credits Recharge',
                      order_id: orderData.id,
                      handler: async function (response) {
                        // 3. Verify payment on backend
                        try {
                          const verifyRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/payments/verify`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({
                              razorpay_order_id: response.razorpay_order_id,
                              razorpay_payment_id: response.razorpay_payment_id,
                              razorpay_signature: response.razorpay_signature,
                              creditsToRecharge: 50
                            })
                          });
                          const verifyData = await verifyRes.json();
                          
                          if (verifyRes.ok && verifyData.success) {
                            // Payment Success!
                            updateUser({ ...user, credits: verifyData.newCredits });
                            alert('Payment successful! 50 Credits added.');
                            onClose();
                          } else {
                            alert('Payment verification failed. Please contact support.');
                          }
                        } catch (err) {
                          alert('Error verifying payment.');
                        }
                      },
                      prefill: {
                        name: user?.name || '',
                        email: user?.email || '',
                      },
                      theme: {
                        color: '#7c6ff7'
                      }
                    };

                    const paymentObject = new window.Razorpay(options);
                    paymentObject.open();

                  } catch (err) {
                    alert(err.message || 'Payment initialization failed.');
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {loading ? 'Processing...' : 'Buy 50 Credits'}
              </button>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
