export interface ExportData {
  profile: any;
  activities: any[];
  goals: any[];
  skills: any[];
  certificates: any[];
  roadmaps: any[];
  journals: any[];
  applications: any[];
  courses: any[];
  pastSemesters: any[];
  exams: any[];
  projects: any[];
  badges: any[];
}

/**
 * Escapes values containing commas, quotes, or newlines for CSV compliance
 */
const escapeCSVValue = (val: any): string => {
  if (val === undefined || val === null) return '';
  let str = String(val).replace(/\r?\n|\r/g, ' '); // replace newlines with space
  if (str.includes(',') || str.includes('"') || str.includes(';')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Compiles application state into a clean Excel/CSV file layout
 */
export const downloadCSV = (data: ExportData) => {
  const sections: string[] = [];

  // 1. Title Summary Card
  sections.push('--- CAREER TRACKER PORTOLIO WORKSPACE SUMMARY ---');
  sections.push(`Exported On,${new Date().toLocaleString()}`);
  sections.push(`Student Member,${escapeCSVValue(data.profile?.name)}`);
  sections.push(`Email Address,${escapeCSVValue(data.profile?.email)}`);
  sections.push(`Profession,${escapeCSVValue(data.profile?.profession)}`);
  sections.push(`Degree,${escapeCSVValue(data.profile?.degree || data.profile?.currentEducation)}`);
  sections.push(`Productivity Score,${data.profile?.productivityScore || 0}%`);
  sections.push(`Current Study Streak,${data.profile?.streakCount || 0} Days`);
  sections.push('');

  // 2. Internship & Job Application Tracking
  sections.push('--- INTERNSHIP & RECRUITMENT PIPELINE TRACKER ---');
  sections.push('Company,Role Title,Type,Status,Date Applied,Salary,Link,Notes');
  data.applications.forEach(app => {
    sections.push([
      escapeCSVValue(app.companyName),
      escapeCSVValue(app.role),
      escapeCSVValue(app.type),
      escapeCSVValue(app.status),
      escapeCSVValue(app.dateApplied),
      escapeCSVValue(app.salary),
      escapeCSVValue(app.link),
      escapeCSVValue(app.notes)
    ].join(','));
  });
  sections.push('');

  // 3. Academic GPA & SGPA Course Metrics
  sections.push('--- COLLEGE ACADEMICS & COURSES LOG ---');
  sections.push('Course Code,Course Name,Credits,Grade,Present,Absent,Quiz 1,Mid-Term,Quiz 2,End-Sem');
  data.courses.forEach(c => {
    sections.push([
      escapeCSVValue(c.code),
      escapeCSVValue(c.name),
      c.credits,
      escapeCSVValue(c.grade || 'N/A'),
      c.attendancePre,
      c.attendanceAbs,
      c.quiz1 !== undefined ? c.quiz1 : '',
      c.midTerm !== undefined ? c.midTerm : '',
      c.quiz2 !== undefined ? c.quiz2 : '',
      c.endSem !== undefined ? c.endSem : ''
    ].join(','));
  });
  sections.push('');

  // 4. Past Semester GPA Track
  sections.push('--- PAST SEMESTER GPAs ---');
  sections.push('Semester ID,Semester Name,GPA');
  data.pastSemesters.forEach(s => {
    sections.push([
      escapeCSVValue(s.id),
      escapeCSVValue(s.name),
      s.gpa
    ].join(','));
  });
  sections.push('');

  // 5. Active Project Board
  sections.push('--- ACTIVE PORTFOLIO PROJECTS BOARD ---');
  sections.push('Title,Lane,Tech Stack,Github Link,Live Link,Description');
  data.projects.forEach(p => {
    sections.push([
      escapeCSVValue(p.title),
      escapeCSVValue(p.lane),
      escapeCSVValue(p.techStack?.join(' | ')),
      escapeCSVValue(p.githubLink),
      escapeCSVValue(p.liveLink),
      escapeCSVValue(p.description)
    ].join(','));
  });
  sections.push('');

  // 6. Professional Reflection Journal
  sections.push('--- PROFESSIONAL REFLECTIONS JOURNAL ---');
  sections.push('Date,Log Title,What I Learned,Challenges Faced,Achievements,Next Sprints');
  data.journals.forEach(j => {
    sections.push([
      escapeCSVValue(j.date),
      escapeCSVValue(j.title),
      escapeCSVValue(j.whatILearned),
      escapeCSVValue(j.challengesFaced),
      escapeCSVValue(j.achievements),
      escapeCSVValue(j.nextDayPlan)
    ].join(','));
  });
  sections.push('');

  // 7. Core Career Goals
  sections.push('--- EXPLICIT CAREER GOALS & MILESTONES ---');
  sections.push('Goal Title,Category,Duration Status,Deadline,Progress %,Is Completed,Milestones');
  data.goals.forEach(g => {
    const mlStrings = g.milestones?.map((m: any) => `[${m.isCompleted ? 'x' : ' '}] ${m.title}`).join(' | ');
    sections.push([
      escapeCSVValue(g.title),
      escapeCSVValue(g.category),
      g.isLongTerm ? 'Long Term' : 'Short Term',
      escapeCSVValue(g.deadline),
      `${g.progressPercentage}%`,
      g.isCompleted ? 'YES' : 'NO',
      escapeCSVValue(mlStrings)
    ].join(','));
  });
  sections.push('');

  // 8. Daily Activities Logger
  sections.push('--- DAILY ROUTINE LOGS ---');
  sections.push('Date,Activity Title,Category,Priority,Hours Spent,Status,Description');
  data.activities.forEach(act => {
    sections.push([
      escapeCSVValue(act.date),
      escapeCSVValue(act.title),
      escapeCSVValue(act.category),
      escapeCSVValue(act.priority),
      act.hoursSpent,
      escapeCSVValue(act.status),
      escapeCSVValue(act.description)
    ].join(','));
  });
  sections.push('');

  // 9. Skill Ratings matrix
  sections.push('--- DETAILED SKILLS & LEVEL MATRIX ---');
  sections.push('Skill Tag,Category,Current Level (1-5),Target Level (1-5),Training Hours,Progress %');
  data.skills.forEach(s => {
    sections.push([
      escapeCSVValue(s.name),
      escapeCSVValue(s.category || 'General'),
      s.currentLevel,
      s.targetLevel,
      s.learningHours,
      `${s.progressPercentage}%`
    ].join(','));
  });

  const rawCSV = sections.join('\n');
  const blob = new Blob(['\uFEFF' + rawCSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `StudentOS_Metrics_Backup_${data.profile?.name?.replace(/\s+/g, '_') || 'Portfolio'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Downloads a high-fidelity fully typed JSON dataset for complete state portability
 */
export const downloadJSON = (data: ExportData) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `StudentOS_JSON_Backup_${data.profile?.name?.replace(/\s+/g, '_') || 'Full_Backup'}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Opens a pristine print-optimized vector PDF template window
 * so the student can print to vector PDF or paper seamlessly,
 * keeping the highest design resolution, CSS alignment, and typography
 */
export const triggerPDFReport = (data: ExportData) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up was blocked. Please allow pop-ups to open the PDF print report workspace.');
    return;
  }

  // Generate beautiful printable report layout
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Portfolio & Academic Audit Report - ${data.profile?.name}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #1e293b;
          background: #ffffff;
          margin: 0;
          padding: 40px;
          line-height: 1.5;
        }
        @media print {
          body {
            padding: 0;
            color: #000000;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
        }
        .header {
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 20px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .header-title h1 {
          margin: 0 0 5px 0;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #0f172a;
        }
        .header-title p {
          margin: 0;
          font-size: 13px;
          color: #64748b;
        }
        .meta-stamp {
          text-align: right;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #64748b;
        }
        .grid-blocks {
          display: grid;
          grid-template-cols: 1fr 1fr;
          gap: 25px;
          margin-bottom: 30px;
        }
        .card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 18px;
          background: #f8fafc;
        }
        .card h3 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #1e3a8a;
          border-bottom: 1px solid #cbd5e1;
          padding-bottom: 6px;
        }
        .stat-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 6px;
        }
        .stat-label {
          color: #64748b;
          font-weight: 500;
        }
        .stat-value {
          color: #0f172a;
          font-weight: 600;
        }
        .section-header {
          background: #eff6ff;
          color: #1e40af;
          font-size: 13px;
          font-weight: 700;
          padding: 8px 14px;
          border-radius: 8px;
          margin: 25px 0 15px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          margin-bottom: 20px;
        }
        th {
          background: #f1f5f9;
          color: #475569;
          text-align: left;
          padding: 8px 10px;
          font-weight: 600;
          border-bottom: 1.5px solid #cbd5e1;
        }
        td {
          padding: 8px 10px;
          border-bottom: 1.5px solid #f1f5f9;
          color: #334155;
        }
        tr:last-child td {
          border-bottom: none;
        }
        .badge {
          display: inline-block;
          font-size: 9px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .badge-success { background: #dcfce7; color: #166534; }
        .badge-warning { background: #fef9c3; color: #854d0e; }
        .badge-info { background: #dbeafe; color: #1e40af; }
        .control-bar {
          background: #1e293b;
          color: #ffffff;
          padding: 15px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          border-radius: 0 0 12px 12px;
          margin-bottom: 30px;
        }
        .control-btn {
          background: #2563eb;
          color: #ffffff;
          border: none;
          padding: 8px 18px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.15s;
        }
        .control-btn:hover {
          background: #1d4ed8;
        }
        .control-secondary-btn {
          background: transparent;
          color: #94a3b8;
          border: 1px solid #475569;
          padding: 8px 14px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
        }
        .progress-bar-outer {
          background: #e2e8f0;
          border-radius: 4px;
          height: 6px;
          width: 80px;
          display: inline-block;
          vertical-align: middle;
        }
        .progress-bar-inner {
          background: #3b82f6;
          height: 100%;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>

      <!-- Sticky Print Trigger control header bar -->
      <div class="control-bar no-print">
        <span style="font-weight: 600; font-size: 13px;">🎓 Student OS: Portfolio Exporter Node</span>
        <div style="display: flex; gap: 10px;">
          <button class="control-secondary-btn" onclick="window.close()">Close Preview</button>
          <button class="control-btn" onclick="window.print()">
            🖨️ Save as Vector PDF / Print
          </button>
        </div>
      </div>

      <!-- Main report structure -->
      <div class="header">
        <div class="header-title">
          <h1>Student Academic & Career Portfolio</h1>
          <p>Official verified accomplishments dossier, learning streaks, and recruitment track records.</p>
        </div>
        <div class="meta-stamp">
          <div>STUDENT OS AUDIT LOG</div>
          <div>TIMESTAMP: ${new Date().toISOString()}</div>
          <div>EXPORT STATUS: VERIFIED</div>
        </div>
      </div>

      <div class="grid-blocks">
        <!-- Student Details Card -->
        <div class="card">
          <h3>Student Member Profile</h3>
          <div class="stat-row">
            <span class="stat-label">Full Name:</span>
            <span class="stat-value">${data.profile?.name || 'N/A'}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Email:</span>
            <span class="stat-value">${data.profile?.email || 'N/A'}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Profession / Target Role:</span>
            <span class="stat-value">${data.profile?.profession || 'N/A'}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Education Group:</span>
            <span class="stat-value">${data.profile?.currentEducation || 'N/A'}</span>
          </div>
        </div>

        <!-- Academic Telemetry summary -->
        <div class="card">
          <h3>Performance Metrics</h3>
          <div class="stat-row">
            <span class="stat-label">Overall Productivity Score:</span>
            <span class="stat-value" style="color:#2563eb;">${data.profile?.productivityScore || 0}%</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Active Learning Streak:</span>
            <span class="stat-value" style="color:#ea580c;">🔥 ${data.profile?.streakCount || 0} Days</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Verified Certifications:</span>
            <span class="stat-value">${data.certificates?.length || 0} Completed</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Achievements Claimed:</span>
            <span class="stat-value">${data.badges?.filter(b => b.isUnlocked).length || 0} Badges</span>
          </div>
        </div>
      </div>

      <!-- Academics Table Section -->
      <div class="section-header">Active Academic Standing & Attendance</div>
      <table>
        <thead>
          <tr>
            <th>Course Code</th>
            <th>Course Name</th>
            <th>Credits</th>
            <th>Grade</th>
            <th>Attendance Present</th>
            <th>Attendance Absent</th>
            <th>Mid-Term / End-Sem Marks</th>
          </tr>
        </thead>
        <tbody>
          ${data.courses.map(c => `
            <tr>
              <td style="font-family:'JetBrains Mono',monospace; font-weight:700;">${c.code}</td>
              <td style="font-weight:555;">${c.name}</td>
              <td>${c.credits} Credits</td>
              <td style="font-family:'JetBrains Mono',monospace; font-weight:700; color:#16a34a;">${c.grade || 'Ongoing'}</td>
              <td>${c.attendancePre} Classes</td>
              <td>${c.attendanceAbs} Classes</td>
              <td>${c.midTerm !== undefined ? `Mid: ${c.midTerm}` : '-'} / ${c.endSem !== undefined ? `End: ${c.endSem}` : '-'}</td>
            </tr>
          `).join('')}
          ${data.courses.length === 0 ? '<tr><td colspan="7" style="text-align:center;">No college course records found.</td></tr>' : ''}
        </tbody>
      </table>

      <!-- Past Semesters GPA tracker -->
      ${data.pastSemesters.length > 0 ? `
        <div style="font-size: 11px; margin-bottom: 25px; padding: 10px; border-left: 3px solid #3b82f6; background: #f8fafc;">
          <strong>Historical CGPA Timeline:</strong> 
          ${data.pastSemesters.map(s => `${s.name}: <span style="font-weight:700;">${s.gpa} GPA</span>`).join(' &nbsp;•&nbsp; ')}
        </div>
      ` : ''}

      <!-- Page break to avoid layout cutoff -->
      <div class="page-break"></div>

      <!-- Internship Track Section -->
      <div class="section-header">Internship & Recruitment Pipeline Stages</div>
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Role Target</th>
            <th>Recruitment Terms</th>
            <th>Timeline Date</th>
            <th>Stage Status</th>
            <th>Compensation Value</th>
            <th>Notes & Progress</th>
          </tr>
        </thead>
        <tbody>
          ${data.applications.map(app => {
            let badgeClass = 'badge-info';
            if (app.status === 'Offer') badgeClass = 'badge-success';
            if (app.status === 'Rejected') badgeClass = 'badge-warning';
            return `
              <tr>
                <td style="font-weight:700; color:#0f172a;">${app.companyName}</td>
                <td>${app.role}</td>
                <td>${app.type}</td>
                <td>${app.dateApplied}</td>
                <td><span class="badge ${badgeClass}">${app.status}</span></td>
                <td style="font-family:'JetBrains Mono',monospace;">${app.salary || 'N/A'}</td>
                <td style="font-size:10px; max-width: 250px; color:#475569;">${app.notes || '-'}</td>
              </tr>
            `;
          }).join('')}
          ${data.applications.length === 0 ? '<tr><td colspan="7" style="text-align:center;">No pipeline records found.</td></tr>' : ''}
        </tbody>
      </table>

      <!-- Active Project Board -->
      <div class="section-header">Active Project & Innovation Cards</div>
      <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
        ${data.projects.map(p => `
          <div style="border: 1px solid #f1f5f9; padding: 12px; border-radius: 8px; background:#fafafa;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:750; font-size:12px; color:#1e293b;">${p.title}</span>
              <span class="badge badge-info" style="font-size:8px;">${p.lane}</span>
            </div>
            <p style="font-size:10.5px; color:#64748b; margin: 4px 0 8px 0;">${p.description}</p>
            <div style="font-family:'JetBrains Mono',monospace; font-size:9px; color:#2563eb;">
              Tech: ${p.techStack?.join(', ') || ''}
            </div>
          </div>
        `).join('')}
        ${data.projects.length === 0 ? '<div style="grid-column: span 2; text-align:center; font-size:11px; color:#94a3b8;">No projects logged.</div>' : ''}
      </div>

      <!-- Professional Reflections -->
      <div class="section-header">Professional reflections diary</div>
      ${data.journals.map(j => `
        <div style="margin-bottom: 20px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 15px;">
          <div style="display:flex; justify-content:space-between; font-size: 11px; margin-bottom: 6px;">
            <strong style="color: #0f172a; font-size: 12px;">📔 ${j.title}</strong>
            <span style="font-family:'JetBrains Mono',monospace; color:#94a3b8;">${j.date}</span>
          </div>
          <div style="font-size: 11px; margin-left: 10px; color: #475569; display: grid; gap: 4px;">
            <div><strong>Key Learning:</strong> ${j.whatILearned}</div>
            <div><strong>Daily Success Achievements:</strong> ${j.achievements}</div>
            <div><strong>Upcoming focus:</strong> ${j.nextDayPlan}</div>
          </div>
        </div>
      `).join('')}
      ${data.journals.length === 0 ? '<p style="text-align:center; font-size:11px; color:#94a3b8;">No entries found in reflections diary</p>' : ''}

    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
