// ============================================================
// DR. FAZAL SCREENING - Google Apps Script
// Deploy as Web App -> Execute as "Me" -> Access: "Anyone"
// ============================================================

const SHEET_NAME = 'ScreeningData';
const SHARED_SECRET = 'DrFazal2026'; // <-- MUST MATCH THE REACT APP
const NOTIFY_EMAIL = 'hamidfazal.ncot@gmail.com';

function doPost(e) {
  try {
    const jsonString = e.postData.contents;
    const data = JSON.parse(jsonString);

    // --- 1. Secret check ---
    if (data.secret !== SHARED_SECRET) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'error', message: 'Unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // --- 2. Get or create sheet ---
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      const headers = [
        'Timestamp', 'Name', 'Age', 'Gender', 'Contact',
        'Concern', 'Status_Text', 'Last_BP', 'Last_Sugar',
        'Mood_Score', 'Safety_Flag', 'Triage_Tier', 'Submission_ID'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }

    // --- 3. Generate ID ---
    const id = Utilities.getUuid().slice(0, 8).toUpperCase();

    // --- 4. Write row ---
    const row = [
      new Date().toISOString(),
      data.name || '',
      data.age || '',
      data.gender || '',
      data.contact || '',
      data.concern || '',
      data.statusText || '',
      data.lastBP || '',
      data.lastSugar || '',
      data.moodScore || '',
      data.safety || '',
      data.triage || '',
      id
    ];
    sheet.appendRow(row);

    // --- 5. Send Email Notification ---
    const subject = `New Screening: ${data.name} (${data.concern}) - ${data.triage}`;
    let body = `📋 **New Patient Screening Received**\n\n`;
    body += `Name: ${data.name}\nAge: ${data.age}\nGender: ${data.gender}\nContact: ${data.contact}\n`;
    body += `Concern: ${data.concern}\nStatus: ${data.statusText || 'N/A'}\n`;
    body += `BP: ${data.lastBP || 'N/A'} | Sugar: ${data.lastSugar || 'N/A'} | Mood: ${data.moodScore || 'N/A'}\n`;
    body += `Safety Risk: ${data.safety}\n\n`;
    body += `🚨 TRIAGE: ${data.triage}\n`;
    body += `Submission ID: ${id}\n\n`;
    body += `---\nThis is an automated screening submission.`;

    if (data.safety === 'Yes') {
      body = `⚠️⚠️⚠️ URGENT SAFETY ALERT ⚠️⚠️⚠️\n\n${body}\n\nPatient reported suicidal/harm ideation. Immediate action required.`;
    }

    GmailApp.sendEmail(NOTIFY_EMAIL, subject, body, {
      name: 'Dr. Fazal Screening Bot'
    });

    // --- 6. Return success ---
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', id: id }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: Test function (run this once to set up headers)
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = [
      'Timestamp', 'Name', 'Age', 'Gender', 'Contact',
      'Concern', 'Status_Text', 'Last_BP', 'Last_Sugar',
      'Mood_Score', 'Safety_Flag', 'Triage_Tier', 'Submission_ID'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}
