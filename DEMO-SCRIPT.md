# EPIA Patient Follow-Up Automation System — 3-Minute Video Demonstration Script

This script is organized with exact timestamps, on-screen actions, and speaking lines to record a concise, professional, 3-minute technical walkthrough.

---

## ⏱️ Video Timing Overview (Total: 2 min 50 sec)

| Timestamp | Segment | Key Demonstration Point |
|---|---|---|
| **0:00 – 0:25** | System Introduction & Dashboard Overview | Application Dashboard & Architecture |
| **0:25 – 0:50** | Fictional Patient Registration | Validation & SQLite Storage |
| **0:50 – 1:10** | Patient Records & Filtering | Search, Filtering, Patient History |
| **1:10 – 1:30** | Today's Due Follow-Up Identification | Due Today Calculation & Status |
| **1:30 – 1:55** | AI WhatsApp Draft Generation | Google Gemini API / Mock AI Engine |
| **1:55 – 2:15** | Message Editing & Customization | Inline Draft Customization |
| **2:15 – 2:35** | Human Approval Workflow | Confirmation Dialog & Review Recording |
| **2:35 – 2:50** | Human-in-the-Loop Safeguard Guarantee | Proving Zero Automated Messages Dispatched |

---

## 🎙️ Step-by-Step Script & Actions

### 1. Application Dashboard (0:00 – 0:25)
- **On Screen:** Start on the main **Dashboard** (`http://localhost:5173`). Highlight the 4 overview cards: *Total Patients*, *Follow-Ups Due Today*, *Completed Follow-Ups*, and *Pending AI Approvals*. Point to the AI Engine indicator ("Gemini Live" / "Mock AI Active") and the Human Supervision banner.
- **Speaking Script:**
  > *"Hello! Welcome to the demonstration of the EPIA Patient Follow-Up Automation System. This application is designed for healthcare clinic staff to manage patient consultations, identify due follow-ups, and generate personalized follow-up message drafts using artificial intelligence with strict human supervision.*
  >
  > *On our dashboard, staff can instantly see key operational metrics: total registered patients, follow-ups scheduled for today, overall care completion rate, and message drafts pending review."*

---

### 2. Adding a Fictional Patient (0:25 – 0:50)
- **On Screen:** Click the **"Register Patient"** button in the header. The registration modal opens. First, enter an invalid phone or a follow-up date earlier than consultation to show live validation, then fill in valid fictional data:
  - **Name:** `Maya Sharma`
  - **Phone:** `+91 98765 22334`
  - **Consultation Date:** *(3 days ago or Today)*
  - **Next Follow-Up Date:** Click the preset **"Due Today"**
  - Click **"Register Patient"**.
- **Speaking Script:**
  > *"Next, let's register a new patient. All inputs are strictly validated on both frontend and backend. Notice how the system prevents invalid phone formats and ensures follow-up dates cannot precede consultation dates.*
  >
  > *We'll register a fictional patient, 'Maya Sharma', scheduled for follow-up today. Upon submitting, the patient record is safely persisted into our SQLite database using prepared statements and logged in the audit trail."*

---

### 3. Viewing Patient Records (0:50 – 1:10)
- **On Screen:** Navigate to the **"Patients"** tab on the sidebar. Type `"Maya"` into the search bar. Show the instant filter. Click the **Eye icon** to view Maya's detailed profile and registration timestamp.
- **Speaking Script:**
  > *"In the Patients registry, clinic staff can view all registered patients. We have real-time search by name or phone, as well as filters by status and date. Clicking 'View' displays the patient's full consultation profile, registered date, and audit history."*

---

### 4. Finding Patients Due Today (1:10 – 1:30)
- **On Screen:** Click **"Due Follow-Ups"** in the sidebar. Point out the badge counter and the banner showing today's local calendar date. Show the list of patients whose `next_follow_up_date` matches today and whose status is pending.
- **Speaking Script:**
  > *"Now let's switch to the 'Due Follow-Ups' page. The backend queries patients whose follow-up date matches today's local date and whose status is pending. Staff can immediately see who requires attention today, their contact details, and their current draft status."*

---

### 5. Generating an AI WhatsApp Message Draft (1:30 – 1:55)
- **On Screen:** Find Maya Sharma or an ungenerated patient in the table. Click **"Generate AI"** (or click **"Generate All Due Drafts"**). Watch the AI inference complete (under 300ms) and redirect to the **"AI Message Drafts"** page showing the newly generated draft card with provider badge ("gemini-1.5-flash" or "mock-ai").
- **Speaking Script:**
  > *"To assist staff, we can trigger AI draft generation. The backend calls Google Gemini—with automatic fallback to our smart template engine if offline. The prompt is strictly controlled: it personalizes the greeting with the patient's first name, provides a courteous reminder, and strictly prohibits sensitive medical diagnoses or clinical advice."*

---

### 6. Editing the Draft (1:55 – 2:15)
- **On Screen:** On the newly generated draft card for Maya Sharma, click **"Edit"**. Modify the message (e.g., append: *"Please let our front desk know if you require wheelchair assistance."*). Watch the live character counter. Click **"Save Draft"**. The card updates immediately.
- **Speaking Script:**
  > *"Human supervision is central to this system. Before anything is finalized, staff can edit the draft. Let's add a note offering front desk assistance. The updated draft is saved back to SQLite and the edit event is recorded in our activity history."*

---

### 7. Approving or Rejecting the Draft (2:15 – 2:35)
- **On Screen:** Click **"Approve"** on the draft card. A confirmation dialog appears with a notice: *"Human Supervision Rule: This action updates approval state in SQLite only. No automated external WhatsApp message will ever be triggered."* Click **"Approve Draft"**. Show the badge switch from amber `pending` to emerald `approved`.
- **Speaking Script:**
  > *"Now we approve the draft. Notice the mandatory confirmation dialog requiring staff verification. When I click 'Approve Draft', the status updates in SQLite to 'approved' along with the staff review timestamp. If staff choose to reject a draft, an optional rejection reason is logged."*

---

### 8. Showing the Updated Status (2:35 – 2:42)
- **On Screen:** Switch back to **"Due Follow-Ups"** or **"Dashboard"**. Show Maya's follow-up can now be marked completed by clicking **"Complete"**. The status changes to `completed` in real time.
- **Speaking Script:**
  > *"Returning to our follow-ups list, staff can mark the patient follow-up as completed once the call or consultation is finished. All metrics across the dashboard update in real time."*

---

### 9. Confirming that No WhatsApp Message is Sent (2:42 – 2:50)
- **On Screen:** Click **"Activity History"** and then **"Settings"**. Point out the Human Supervision Policy card: *"Automated Messaging: Disabled / Dispatched: 0"*.
- **Speaking Script:**
  > *"Most importantly: no WhatsApp messages are ever automatically sent. Approval simply records staff sign-off in the clinic's local database, ensuring complete patient privacy and 100% human-in-the-loop compliance.*
  >
  > *Thank you for reviewing the EPIA Patient Follow-Up Automation System!"*

---

## 💡 Quick Tips for the Recording

1. **Terminal Setup:**
   - In Terminal 1: `cd backend && npm start` (runs on `http://localhost:5000`)
   - In Terminal 2: `cd frontend && npm run dev` (runs on `http://localhost:5173`)
2. **Fresh Demo Reset:**
   - Run `cd backend && npm run seed` right before recording to have fresh test patients scheduled for today.
3. **Screen Resolution:**
   - Set browser zoom to 100% at 1920x1080 for crisp typography and card rendering.

