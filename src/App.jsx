import React, { useState } from 'react';

// ---------- CONFIG ----------
const SHARED_SECRET = 'DrFazal2026'; // <-- CHANGE THIS IF YOU WANT
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz_Tsm3XRdjyXZ_rl7f4_euQiL7wEyfPgQLxwX6hRYTVM87g76VlTJulopsQe12_-A7/exec'; // <-- FILL AFTER DEPLOY

export default function App() {
  // --- State ---
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    contact: '',
    concern: 'Mental Health',
    statusText: '',
    lastBP: '',
    lastSugar: '',
    moodScore: '5',
    safety: 'No',
  });

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // --- Triage Logic (deterministic) ---
  const evaluateTriage = (data) => {
    // 1. Safety flag
    if (data.safety === 'Yes') return 'URGENT - Safety Risk';

    // 2. BP check (parse numbers)
    const bpParts = data.lastBP.split('/');
    if (bpParts.length === 2) {
      const sys = parseInt(bpParts[0]);
      const dia = parseInt(bpParts[1]);
      if (sys > 180 || dia > 120) return 'URGENT - Hypertensive Crisis';
    }

    // 3. Blood Sugar check
    const sugar = parseInt(data.lastSugar);
    if (sugar > 300) return 'URGENT - Hyperglycemia';

    return 'Normal - Routine Follow-up';
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });

    const triage = evaluateTriage(form);

    const payload = {
      ...form,
      triage: triage,
      timestamp: new Date().toISOString(),
      secret: SHARED_SECRET,
    };

    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus({ type: 'success', message: `✓ Record sent successfully! Triage: ${triage}` });
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: `⚠ Could not be sent — please call clinic directly. Error: ${err.message}`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // --- Render ---
  return (
    <div className="card">
      <div className="header">
        <h1>🫀 Dr. Hamid Fazal</h1>
        <div className="sub">MBBS, ECFMG Certified, PGD (Nutrition)</div>
        <div style={{ fontSize: '13px', color: '#4b5563', marginTop: '4px' }}>
          <span className="urdu">خوش آمدید</span> · Wellness Screening
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <label>
          Full Name <span className="urdu-tag">(نام)</span>
        </label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <div className="row-2">
          <div>
            <label>Age</label>
            <input type="number" name="age" value={form.age} onChange={handleChange} required />
          </div>
          <div>
            <label>Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} required>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <label>Contact (Phone / Email)</label>
        <input name="contact" value={form.contact} onChange={handleChange} required />

        <label>
          Primary Concern <span className="urdu-tag">(بنیادی مسئلہ)</span>
        </label>
        <select name="concern" value={form.concern} onChange={handleChange}>
          <option value="Mental Health">Mental Health (دماغی صحت)</option>
          <option value="Diabetes">Diabetes (ذیابیطس)</option>
          <option value="Hypertension">Hypertension (ہائی بلڈ پریشر)</option>
          <option value="Nutrition">Nutrition / Weight (غذائیت)</option>
          <option value="General">General Check-up</option>
        </select>

        <label>
          Current Status / Symptoms <span className="urdu-tag">(کیا محسوس کر رہے ہیں؟)</span>
        </label>
        <textarea
          rows="3"
          name="statusText"
          value={form.statusText}
          onChange={handleChange}
          placeholder="e.g., Feeling tired, headaches, high stress..."
        />

        {/* Conditional fields based on concern */}
        {(form.concern === 'Diabetes' || form.concern === 'General') && (
          <div>
            <label>Last Blood Sugar (mg/dL) <span className="urdu-tag">(شوگر)</span></label>
            <input name="lastSugar" value={form.lastSugar} onChange={handleChange} placeholder="e.g., 140" />
          </div>
        )}

        {(form.concern === 'Hypertension' || form.concern === 'General') && (
          <div>
            <label>Last BP Reading <span className="urdu-tag">(بلڈ پریشر)</span></label>
            <input name="lastBP" value={form.lastBP} onChange={handleChange} placeholder="e.g., 130/85" />
          </div>
        )}

        {(form.concern === 'Mental Health' || form.concern === 'General') && (
          <div>
            <label>Mood / Anxiety Level (1 = Calm, 10 = Severe)</label>
            <input
              type="range"
              min="1"
              max="10"
              name="moodScore"
              value={form.moodScore}
              onChange={handleChange}
              style={{ padding: '0', accentColor: '#047857' }}
            />
            <div style={{ textAlign: 'center', fontWeight: 'bold' }}>Score: {form.moodScore}</div>
          </div>
        )}

        {/* SAFETY DANGER ZONE */}
        <div className="danger-zone">
          <label style={{ fontWeight: '800' }}>
            ⚠️ Are you having thoughts of harming yourself or others? <br />
            <span className="urdu-tag" style={{ color: '#991b1b' }}>
              (کیا آپ خود کو یا دوسروں کو نقصان پہنچانے کے بارے میں سوچ رہے ہیں؟)
            </span>
          </label>
          <select name="safety" value={form.safety} onChange={handleChange} style={{ borderColor: '#fca5a5' }}>
            <option value="No">No</option>
            <option value="Yes">Yes — I need immediate help</option>
          </select>
          {form.safety === 'Yes' && (
            <div style={{ marginTop: '12px', background: '#dc2626', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: 'bold', textAlign: 'center' }}>
              🚨 URGENT: Please call 15 (Emergency) or visit your nearest ER immediately.
            </div>
          )}
        </div>

        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Sending...' : '📤 Submit Screening'}
        </button>

        {status.message && (
          <div className={`status ${status.type}`}>
            {status.message}
          </div>
        )}

        <div className="footer-note">
          This is a pre-screening tool. It does not replace a full clinical evaluation.
          {form.safety === 'Yes' && ' 🔴 If you are in crisis, do not wait — seek help now.'}
        </div>
      </form>
    </div>
  );
}
