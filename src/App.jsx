import React, { useState } from 'react';

// ---------- CONFIG ----------
const SHARED_SECRET = 'DrFazal2026';
const APPS_SCRIPT_URL = 'PASTE_YOUR_APPS_SCRIPT_EXEC_URL_HERE'; // <-- UPDATE AFTER DEPLOY

export default function App() {
  // --- All form fields (V1 + V2 new ones) ---
  const [form, setForm] = useState({
    // Step 1: Personal
    name: '',
    age: '',
    gender: '',
    contact: '',
    // Step 2: Medical & Lifestyle (NEW)
    duration: '',
    medications: '',
    allergies: '',
    familyHistory: [], // array of strings
    sleep: '',
    appetite: '',
    exercise: '',
    // Condition-specific (NEW)
    lastHba1c: '',
    currentBpMeds: '',
    previousPsychDiagnosis: '',
    // Step 3: Status & Safety
    concern: 'Mental Health',
    statusText: '',
    lastBP: '',
    lastSugar: '',
    moodScore: '5',
    safety: 'No',
  });

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // --- Handler for text/select/range ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // --- Handler for checkboxes (Family History) ---
  const handleFamilyHistory = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => {
      if (checked) {
        return { ...prev, familyHistory: [...prev.familyHistory, value] };
      } else {
        return { ...prev, familyHistory: prev.familyHistory.filter((item) => item !== value) };
      }
    });
  };

  // --- Navigation ---
  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // --- Triage Logic (unchanged, deterministic) ---
  const evaluateTriage = (data) => {
    if (data.safety === 'Yes') return 'URGENT - Safety Risk';
    const bpParts = data.lastBP.split('/');
    if (bpParts.length === 2) {
      const sys = parseInt(bpParts[0]);
      const dia = parseInt(bpParts[1]);
      if (sys > 180 || dia > 120) return 'URGENT - Hypertensive Crisis';
    }
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
    // flatten familyHistory array into a comma-separated string for the sheet
    const payload = {
      ...form,
      familyHistory: form.familyHistory.join(', '),
      triage,
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
        // Optionally reset form here if you want
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

  // --- Render Step 1 ---
  const renderStep1 = () => (
    <div className="step-content">
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

      <label>
        Contact (Phone / Email) <span className="urdu-tag">(رابطہ)</span>
      </label>
      <input name="contact" value={form.contact} onChange={handleChange} required />
    </div>
  );

  // --- Render Step 2 (NEW fields) ---
  const renderStep2 = () => (
    <div className="step-content">
      <label>
        Duration of current complaint <span className="urdu-tag">(کتنی دیر سے)</span>
      </label>
      <select name="duration" value={form.duration} onChange={handleChange}>
        <option value="">Select</option>
        <option value="< 1 week">Less than 1 week</option>
        <option value="1-4 weeks">1–4 weeks</option>
        <option value="> 1 month">More than 1 month</option>
      </select>

      <label>Current medications (if any)</label>
      <input name="medications" value={form.medications} onChange={handleChange} placeholder="e.g., Metformin, Lisinopril" />

      <label>Known allergies</label>
      <input name="allergies" value={form.allergies} onChange={handleChange} placeholder="e.g., Penicillin, Sulfa, None" />

      <label>Family history <span className="urdu-tag">(خاندانی تاریخ)</span></label>
      <div className="checkbox-group">
        {['Diabetes', 'Hypertension', 'Mental Health', 'Heart Disease', 'None'].map((opt) => (
          <label key={opt}>
            <input
              type="checkbox"
              value={opt}
              checked={form.familyHistory.includes(opt)}
              onChange={handleFamilyHistory}
            />
            {opt}
          </label>
        ))}
      </div>

      <div className="row-2">
        <div>
          <label>Sleep quality</label>
          <select name="sleep" value={form.sleep} onChange={handleChange}>
            <option value="">Select</option>
            <option value="Poor">Poor</option>
            <option value="Fair">Fair</option>
            <option value="Good">Good</option>
            <option value="Excellent">Excellent</option>
          </select>
        </div>
        <div>
          <label>Appetite changes</label>
          <select name="appetite" value={form.appetite} onChange={handleChange}>
            <option value="">Select</option>
            <option value="Increased">Increased</option>
            <option value="Decreased">Decreased</option>
            <option value="Same">Same</option>
          </select>
        </div>
      </div>

      <label>Exercise frequency</label>
      <select name="exercise" value={form.exercise} onChange={handleChange}>
        <option value="">Select</option>
        <option value="Daily">Daily</option>
        <option value="2-3x/week">2–3 times a week</option>
        <option value="Rarely">Rarely</option>
        <option value="Never">Never</option>
      </select>

      {/* Condition-specific fields */}
      <div style={{ marginTop: '12px', padding: '12px', background: '#f0fdf4', borderRadius: '16px' }}>
        <p style={{ fontWeight: 'bold', color: '#065f46' }}>🩺 Condition-specific details</p>
        {(form.concern === 'Diabetes' || form.concern === 'General') && (
          <div>
            <label>Last HbA1c (%)</label>
            <input name="lastHba1c" value={form.lastHba1c} onChange={handleChange} placeholder="e.g., 7.2" />
          </div>
        )}
        {(form.concern === 'Hypertension' || form.concern === 'General') && (
          <div>
            <label>Current BP medications</label>
            <input name="currentBpMeds" value={form.currentBpMeds} onChange={handleChange} placeholder="e.g., Amlodipine, Losartan" />
          </div>
        )}
        {(form.concern === 'Mental Health' || form.concern === 'General') && (
          <div>
            <label>Previous psychiatric diagnosis</label>
            <input name="previousPsychDiagnosis" value={form.previousPsychDiagnosis} onChange={handleChange} placeholder="e.g., Depression, Anxiety, PTSD" />
          </div>
        )}
      </div>
    </div>
  );

  // --- Render Step 3 (Status + Safety) ---
  const renderStep3 = () => (
    <div className="step-content">
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
        placeholder="e.g., Fatigue, headaches, stress, weight changes..."
      />

      <div className="row-2">
        {(form.concern === 'Diabetes' || form.concern === 'General') && (
          <div>
            <label>Last Blood Sugar (mg/dL)</label>
            <input name="lastSugar" value={form.lastSugar} onChange={handleChange} placeholder="e.g., 140" />
          </div>
        )}
        {(form.concern === 'Hypertension' || form.concern === 'General') && (
          <div>
            <label>Last BP (systolic/diastolic)</label>
            <input name="lastBP" value={form.lastBP} onChange={handleChange} placeholder="e.g., 130/85" />
          </div>
        )}
      </div>

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
    </div>
  );

  // --- Main Render with Wizard ---
  const progress = ((step - 1) / 2) * 100;

  return (
    <div className="card">
      <div className="header">
        <h1>🫀 Dr. Hamid Fazal</h1>
        <div className="sub">MBBS, ECFMG Certified, PGD (Nutrition)</div>
        <div style={{ fontSize: '13px', color: '#4b5563', marginTop: '4px' }}>
          <span className="urdu">خوش آمدید</span> · Wellness Screening V2
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="step-indicators">
          <span className={step >= 1 ? 'active' : ''}>Step 1: Personal</span>
          <span className={step >= 2 ? 'active' : ''}>Step 2: History</span>
          <span className={step >= 3 ? 'active' : ''}>Step 3: Status</span>
        </div>
        <div className="progress-bar">
          <div className="fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step Rendering */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Navigation Buttons */}
        <div className="btn-row">
          {step > 1 && (
            <button type="button" className="btn-secondary" onClick={prevStep} disabled={submitting}>
              ⬅ Back
            </button>
          )}
          {step < 3 ? (
            <button type="button" className="btn-primary" onClick={nextStep} disabled={submitting}>
              Next ➡
            </button>
          ) : (
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Sending...' : '📤 Submit Screening'}
            </button>
          )}
        </div>

        {/* Status Message */}
        {status.message && (
          <div className={`status ${status.type}`}>
            {status.message}
          </div>
        )}

        <div className="footer-note">
          This is a pre-screening tool. It does not replace a full clinical evaluation.
          {form.safety === 'Yes' && ' 🔴 If in crisis, seek help now.'}
        </div>
      </form>
    </div>
  );
}
