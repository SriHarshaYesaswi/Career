/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCareer } from '../context/CareerContext';
import { CertificateDoc, CertificateType } from '../types';
import { 
  Award, 
  Trash2, 
  Plus, 
  X, 
  Download, 
  Calendar, 
  Briefcase, 
  Sparkles, 
  BookOpen, 
  FileText,
  FileCheck,
  Search,
  UploadCloud,
  Trophy
} from 'lucide-react';

export const Certificates: React.FC = () => {
  const { certificates, addCertificate, deleteCertificate } = useCareer();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [type, setType] = useState<CertificateType>('Course Completion');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');

  const types: CertificateType[] = [
    'Internship Offer',
    'Hackathon',
    'Competition',
    'Workshop',
    'Course Completion',
    'Academic Merit'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !issuer) return;

    addCertificate({
      title,
      issuer,
      type,
      issueDate,
      description,
      fileMockName: fileName || `${title.toLowerCase().replace(/\s+/g, '_')}_cert.pdf`
    });

    // Reset states
    setTitle('');
    setIssuer('');
    setType('Course Completion');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setFileName('');
    setIsModalOpen(false);
  };

  // Simulated download anchor maker
  const handleDownload = (cert: CertificateDoc) => {
    // Generate a simple simulated offline text file representation of the certificate
    const content = `=================================================
CERTIFICATE OF ACHIEVEMENT (OFFLINE REPLICA)
=================================================
Document Identification: ${cert.id}
Recipient User UID: ${cert.userId}

Title of Achievement: ${cert.title}
Issued & Validated by: ${cert.issuer}
Type of Event Category: ${cert.type}
Verification Date: ${cert.issueDate}

Description Reference:
"${cert.description}"

Status: SECURE LOCAL VERIFIED OFFLINE
=================================================`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = cert.fileMockName.replace('.pdf', '_replica.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getBadgeTypeStyles = (t: CertificateType) => {
    switch (t) {
      case 'Internship Offer': return { bg: 'bg-blue-50 border-blue-200 text-blue-800', icon: <Briefcase className="w-4 h-4 text-blue-600" /> };
      case 'Hackathon': return { bg: 'bg-purple-50 border-purple-200 text-purple-800', icon: <Trophy className="w-4 h-4 text-purple-600" /> };
      case 'Competition': return { bg: 'bg-rose-50 border-rose-200 text-rose-800', icon: <Sparkles className="w-4 h-4 text-rose-600" /> };
      case 'Workshop': return { bg: 'bg-slate-100 border-slate-200 text-slate-800', icon: <BookOpen className="w-4 h-4 text-slate-750" /> };
      case 'Course Completion': return { bg: 'bg-indigo-50 border-indigo-200 text-indigo-800', icon: <FileCheck className="w-4 h-4 text-indigo-600" /> };
      case 'Academic Merit': return { bg: 'bg-amber-50 border-amber-200 text-amber-800', icon: <Award className="w-4 h-4 text-amber-600" /> };
    }
  };

  // Filter achievements
  const filteredCerts = certificates.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.issuer.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => b.issueDate.localeCompare(a.issueDate));

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-900 dark:text-white">Certificate & Achievement Vault</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Record offer letters, hackathon honors, and workshop validations on a visual milestone timeline</p>
        </div>

        <div className="flex gap-2 items-center w-full sm:w-auto">
          {/* Search box inline */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter accomplishments..."
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-705 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-44 sm:w-56"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Certificate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Chronological interactive timeline */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs p-6 space-y-6 transition-colors">
          <h2 className="text-sm font-display font-bold uppercase tracking-widest text-slate-400 dark:text-slate-550">
            Professional Trajectory Timeline
          </h2>

          <div className="relative border-l-2 border-dashed border-slate-200 dark:border-slate-800 pl-6 ml-4 space-y-8 py-2">
            {filteredCerts.map((cert) => {
              const theme = getBadgeTypeStyles(cert.type);
              return (
                <div key={cert.id} className="relative">
                  {/* Timeline bullet indicator */}
                  <div className="absolute -left-[37px] top-1.5 w-7 h-7 rounded-full border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 flex items-center justify-center shadow-xs transition-colors">
                    {theme.icon}
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-100/60 dark:hover:border-blue-900/40 bg-slate-50/20 dark:bg-slate-950/20 shadow-xs space-y-2 group transition-all">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${theme.bg}`}>
                          {cert.type}
                        </span>
                        <h4 className="font-display font-bold text-slate-900 text-xs sm:text-sm leading-snug mt-1.5 group-hover:text-blue-600 transition-colors">
                          {cert.title}
                        </h4>
                        <p className="text-slate-500 text-[11px] font-medium">{cert.issuer}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleDownload(cert)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
                          title="Download local verifiable replica"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => deleteCertificate(cert.id)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {cert.description && (
                      <p className="text-xs text-slate-500 leading-relaxed font-sans">{cert.description}</p>
                    )}

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono pt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Issue Date: {cert.issueDate}</span>
                      <span>•</span>
                      <span className="truncate max-w-[150px]">{cert.fileMockName}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredCerts.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                No verified achievements logged in your profile timeline yet.
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Upload credentials teaser & guidelines card */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-lg space-y-4">
            <h3 className="font-display font-bold text-sm">Offline Storage Parameters</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              In your offline workspace environment, uploaded credential files (PDF/Images) are safely mapped. We persist the metadata, labels, and descriptions. They generate valid ASCII templates on-demand so you can immediately present validation references on requests.
            </p>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-705 text-[11px] text-blue-300 font-semibold flex items-center gap-2">
              <UploadCloud className="w-5 h-5 flex-shrink-0 text-blue-400" />
              <span>Drag & Drop files or select mock directories instantly.</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 space-y-3.5 transition-colors">
            <h4 className="font-display font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-widest">
              Available Timeline Types
            </h4>
            <div className="space-y-2">
              {types.map((t) => {
                const styles = getBadgeTypeStyles(t);
                return (
                  <div key={t} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-xl">
                    <span className="font-semibold text-slate-750 dark:text-slate-300">{t}</span>
                    <span className="p-1 rounded-sm">{styles.icon}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* POPUP MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-150 dark:border-slate-800 shadow-2xl p-6 relative transition-colors">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-1.5">
              <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Upload Verified Certificate
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Certificate Name or Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AWS Cloud Practitioner Certification"
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Issuing Organization Platform
                </label>
                <input
                  type="text"
                  required
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  placeholder="e.g. Amazon Web Services (AWS)"
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Event Type Category
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CertificateType)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                  >
                    {types.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Issuance Date
                  </label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Achievement Background & Notes
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize context of the award, key syllabus modules passed, score metric achieved..."
                  rows={2}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* MOCK DRAG & DROP FILE UPLOAD SLIDER */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Local Document (PDF / Image) Upload
                </label>
                <div 
                  onClick={() => {
                        const filePrompt = prompt('Enter offline file placeholder name:', 'aws_practitioner_credential.pdf');
                        if (filePrompt) setFileName(filePrompt);
                  }}
                  className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-xl p-4 text-center hover:border-blue-500 cursor-pointer hover:bg-blue-50/10 transition-all space-y-1"
                >
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">
                    {fileName ? `Attached: ${fileName}` : 'Click to bind a mock certification document'}
                  </p>
                  <p className="text-[10px] text-slate-400">PDF, PNG or JPG (Supports size up to 10MB)</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer"
                >
                  Register Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
