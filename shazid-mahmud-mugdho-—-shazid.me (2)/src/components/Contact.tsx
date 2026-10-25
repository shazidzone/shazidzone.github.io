import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Mail,
  Send
} from 'lucide-react';
import { type SiteConfig } from '../data/siteConfig.js';
import { SocialLinks } from './SocialLinks';
import {
  CONTACT_LIMITS,
  validateContactPayload
} from '../utils/contactValidation';

interface ContactProps {
  config: SiteConfig;
}

type SubmissionState = 'idle' | 'submitting' | 'success' | 'unconfigured' | 'error';

export const Contact: React.FC<ContactProps> = ({ config }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  // Honeypot field (hidden from human visitors)
  const [website, setWebsite] = useState('');

  // Validation & submission state
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<'name' | 'email' | 'subject' | 'message' | 'form', string>>
  >({});
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [serverFeedback, setServerFeedback] = useState<string>('');
  const [copiedFallback, setCopiedFallback] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(config.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  const buildFallbackMailto = (): string => {
    const cleanName = name.trim() || 'Website Visitor';
    const cleanEmail = email.trim();
    const cleanSubject =
      subject.trim() || `New message from ${cleanName} via shazid.me`;
    const bodyLines = [
      `Name: ${cleanName}`,
      cleanEmail ? `Email: ${cleanEmail}` : '',
      '',
      message.trim()
    ]
      .filter(Boolean)
      .join('\n');

    return `mailto:${config.email}?subject=${encodeURIComponent(
      cleanSubject
    )}&body=${encodeURIComponent(bodyLines)}`;
  };

  const handleCopyFallbackMessage = async () => {
    const cleanName = name.trim() || 'Website Visitor';
    const cleanSubject =
      subject.trim() || `New message from ${cleanName} via shazid.me`;
    const text = `To: ${config.email}\nFrom: ${cleanName} <${email.trim()}>\nSubject: ${cleanSubject}\n\n${message.trim()}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFallback(true);
      setTimeout(() => setCopiedFallback(false), 2500);
    } catch {
      setCopiedFallback(true);
      setTimeout(() => setCopiedFallback(false), 2500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateContactPayload({
      name,
      email,
      subject,
      message,
      website
    });

    if (!validation.valid) {
      setFieldErrors(validation.errors);
      setSubmissionState('idle');
      return;
    }

    setFieldErrors({});
    setSubmissionState('submitting');
    setServerFeedback('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          website
        })
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        code?: string;
        error?: string;
        message?: string;
        fieldErrors?: Partial<
          Record<'name' | 'email' | 'subject' | 'message' | 'form', string>
        >;
      };

      if (response.ok && data.ok === true) {
        setSubmissionState('success');
        setServerFeedback(
          data.message || `Your message has been delivered to ${config.email}.`
        );
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        setWebsite('');
        return;
      }

      if (data.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
        setFieldErrors(data.fieldErrors);
        setSubmissionState('idle');
        return;
      }

      if (
        response.status === 503 ||
        data.code === 'EMAIL_SERVICE_NOT_CONFIGURED'
      ) {
        setSubmissionState('unconfigured');
        setServerFeedback(
          data.error ||
            `Automated email delivery is not yet configured on this server. Please send your message directly to ${config.email} below.`
        );
        return;
      }

      setSubmissionState('error');
      setServerFeedback(
        data.error ||
          `We could not deliver your message right now. Please email ${config.email} directly.`
      );
    } catch {
      setSubmissionState('error');
      setServerFeedback(
        `Unable to reach the contact server. Please send your message directly to ${config.email}.`
      );
    }
  };

  return (
    <section id="contact" className="relative py-24 md:py-32 overflow-hidden">
      {/* Subtle Ambient Electric Blue Horizon */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-[10%] w-[500px] h-[500px] rounded-full opacity-15 blur-[140px]"
        style={{
          background: 'radial-gradient(circle, #3978FF 0%, transparent 70%)'
        }}
      />

      <div className="relative max-w-[1280px] mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 items-start">
          {/* Left 5 Columns: Monumental Editorial Invitation & Unboxed Channels */}
          <div className="lg:col-span-5 space-y-10">
            <div>
              <div className="flex items-baseline gap-4 mb-4">
                <span className="font-serif-editorial italic text-3xl text-[#3978FF]">
                  04.
                </span>
                <span className="text-xs font-mono text-[#8993A4]">
                  Initiate Dialogue
                </span>
              </div>

              <h2
                className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold text-[#F4F5F7] tracking-tight leading-[1.1]"
                style={{ textWrap: 'balance' }}
              >
                Let’s connect{' '}
                <span className="font-serif-editorial italic font-normal text-[#8993A4]">
                  directly.
                </span>
              </h2>

              <p className="mt-4 text-base text-[#8993A4] font-light leading-relaxed">
                Have a question, collaboration inquiry, or simply want to say
                hello? Send a message or reach out through my verified channels.
              </p>
            </div>

            {/* Monumental Direct Email Display */}
            <div className="pt-6 border-t border-white/10">
              <p className="text-xs font-mono text-[#8993A4] mb-2">
                Direct Electronic Mail
              </p>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <a
                  href={`mailto:${config.email}`}
                  className="font-display text-2xl sm:text-3xl font-semibold text-[#F4F5F7] hover:text-[#3978FF] transition-colors tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3978FF] rounded-xs"
                >
                  {config.email}
                </a>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[36px] text-xs font-mono text-[#F4F5F7] bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3978FF]"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#3978FF]" aria-hidden="true" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#8993A4]" aria-hidden="true" />
                      <span>Copy Address</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Unboxed Hairline Social Channels */}
            <div>
              <p className="text-xs font-mono text-[#8993A4] mb-3">
                Verified Channels
              </p>
              <SocialLinks variant="contact" config={config} />
            </div>
          </div>

          {/* Right 7 Columns: Architectural Dark-Glass Contact Form */}
          <div className="lg:col-span-7">
            <div className="relative p-7 sm:p-10 rounded-2xl bg-gradient-to-b from-[#141925] to-[#0B0E15] border border-white/[0.09] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.85)]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3978FF]/60 to-transparent"
              />

              <div className="flex items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
                <div>
                  <h3 className="font-display text-xl font-semibold text-[#F4F5F7]">
                    Send a Message
                  </h3>
                  <p className="text-xs font-mono text-[#8993A4] mt-1">
                    Recipient · {config.email}
                  </p>
                </div>
                <Mail className="w-5 h-5 text-[#3978FF] shrink-0" aria-hidden="true" />
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
                {/* Hidden Honeypot Input for Bot/Spam Protection */}
                <div className="sr-only" aria-hidden="true">
                  <label htmlFor="contact-website">
                    Website (leave this field empty)
                  </label>
                  <input
                    id="contact-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-medium text-[#F4F5F7] mb-2"
                    >
                      Your Name <span className="text-[#3978FF]">*</span>
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      maxLength={CONTACT_LIMITS.NAME_MAX}
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (fieldErrors.name) {
                          setFieldErrors((prev) => ({ ...prev, name: undefined }));
                        }
                      }}
                      aria-invalid={Boolean(fieldErrors.name)}
                      aria-describedby={fieldErrors.name ? 'error-name' : undefined}
                      placeholder="Alex Rahman"
                      className={`w-full px-4 py-3 min-h-[46px] text-sm rounded-xl bg-[#090B10]/90 border text-[#F4F5F7] placeholder-[#8993A4]/45 focus:outline-none transition-colors ${
                        fieldErrors.name
                          ? 'border-rose-500 focus:border-rose-400'
                          : 'border-white/10 focus:border-[#3978FF] focus:ring-1 focus:ring-[#3978FF]'
                      }`}
                    />
                    {fieldErrors.name && (
                      <p id="error-name" className="mt-1.5 text-xs text-rose-400">
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-medium text-[#F4F5F7] mb-2"
                    >
                      Your Email <span className="text-[#3978FF]">*</span>
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      maxLength={CONTACT_LIMITS.EMAIL_MAX}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) {
                          setFieldErrors((prev) => ({ ...prev, email: undefined }));
                        }
                      }}
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={fieldErrors.email ? 'error-email' : undefined}
                      placeholder="alex@example.com"
                      className={`w-full px-4 py-3 min-h-[46px] text-sm rounded-xl bg-[#090B10]/90 border text-[#F4F5F7] placeholder-[#8993A4]/45 focus:outline-none transition-colors ${
                        fieldErrors.email
                          ? 'border-rose-500 focus:border-rose-400'
                          : 'border-white/10 focus:border-[#3978FF] focus:ring-1 focus:ring-[#3978FF]'
                      }`}
                    />
                    {fieldErrors.email && (
                      <p id="error-email" className="mt-1.5 text-xs text-rose-400">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-xs font-medium text-[#F4F5F7] mb-2"
                  >
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    maxLength={CONTACT_LIMITS.SUBJECT_MAX}
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      if (fieldErrors.subject) {
                        setFieldErrors((prev) => ({ ...prev, subject: undefined }));
                      }
                    }}
                    aria-invalid={Boolean(fieldErrors.subject)}
                    aria-describedby={fieldErrors.subject ? 'error-subject' : undefined}
                    placeholder="Project inquiry or hello"
                    className={`w-full px-4 py-3 min-h-[46px] text-sm rounded-xl bg-[#090B10]/90 border text-[#F4F5F7] placeholder-[#8993A4]/45 focus:outline-none transition-colors ${
                      fieldErrors.subject
                        ? 'border-rose-500 focus:border-rose-400'
                        : 'border-white/10 focus:border-[#3978FF] focus:ring-1 focus:ring-[#3978FF]'
                    }`}
                  />
                  {fieldErrors.subject && (
                    <p id="error-subject" className="mt-1.5 text-xs text-rose-400">
                      {fieldErrors.subject}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-medium text-[#F4F5F7]"
                    >
                      Message <span className="text-[#3978FF]">*</span>
                    </label>
                    <span className="text-[11px] font-mono text-[#8993A4] tabular-nums">
                      {message.length}/{CONTACT_LIMITS.MESSAGE_MAX}
                    </span>
                  </div>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    required
                    maxLength={CONTACT_LIMITS.MESSAGE_MAX}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (fieldErrors.message) {
                        setFieldErrors((prev) => ({ ...prev, message: undefined }));
                      }
                    }}
                    aria-invalid={Boolean(fieldErrors.message)}
                    aria-describedby={fieldErrors.message ? 'error-message' : undefined}
                    placeholder="Write your message here (minimum 10 characters)..."
                    className={`w-full px-4 py-3.5 text-sm rounded-xl bg-[#090B10]/90 border text-[#F4F5F7] placeholder-[#8993A4]/45 focus:outline-none transition-colors resize-y ${
                      fieldErrors.message
                        ? 'border-rose-500 focus:border-rose-400'
                        : 'border-white/10 focus:border-[#3978FF] focus:ring-1 focus:ring-[#3978FF]'
                    }`}
                  />
                  {fieldErrors.message && (
                    <p id="error-message" className="mt-1.5 text-xs text-rose-400">
                      {fieldErrors.message}
                    </p>
                  )}
                </div>

                {fieldErrors.form && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#090B10] border border-rose-500/40 text-xs text-rose-300"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{fieldErrors.form}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={submissionState === 'submitting'}
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 min-h-[48px] text-sm font-medium text-[#F4F5F7] bg-[#3978FF] hover:bg-[#2A66EE] disabled:opacity-60 disabled:pointer-events-none rounded-full shadow-[0_0_30px_-5px_rgba(57,120,255,0.6)] transition-all duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3978FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#151922]"
                  >
                    {submissionState === 'submitting' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>

                  <span className="text-xs font-mono text-[#8993A4]">
                    Validated &amp; rate-limited
                  </span>
                </div>
              </form>

              {/* Confirmed Backend Success State */}
              {submissionState === 'success' && (
                <div
                  role="status"
                  aria-live="polite"
                  className="mt-6 p-4 rounded-xl bg-[#090B10] border border-emerald-500/50 flex items-start gap-3"
                >
                  <CheckCircle2
                    className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#F4F5F7]">
                      Message Sent Successfully
                    </p>
                    <p className="text-xs text-[#8993A4] mt-1">{serverFeedback}</p>
                  </div>
                </div>
              )}

              {/* Honest Fallback State When Email Service Is Not Configured or Returns an Error */}
              {(submissionState === 'unconfigured' || submissionState === 'error') && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="mt-6 p-5 rounded-xl bg-[#090B10] border border-amber-500/50 space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      className="w-5 h-5 text-amber-400 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#F4F5F7]">
                        {submissionState === 'unconfigured'
                          ? 'Email service not configured'
                          : 'Message Delivery Issue'}
                      </p>
                      <p className="text-xs text-[#8993A4] mt-1 leading-relaxed">
                        {serverFeedback}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-3">
                    <a
                      href={buildFallbackMailto()}
                      className="inline-flex items-center gap-2 px-4 py-2 min-h-[38px] text-xs font-semibold text-[#F4F5F7] bg-[#3978FF] hover:bg-[#2E69E6] rounded-full transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3978FF]"
                    >
                      <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Send via Email App ({config.email})</span>
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>

                    <button
                      type="button"
                      onClick={handleCopyFallbackMessage}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] text-xs font-mono text-[#F4F5F7] bg-[#151922] hover:bg-[#1E2433] border border-white/10 rounded-full transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3978FF]"
                    >
                      {copiedFallback ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#3978FF]" aria-hidden="true" />
                          <span>Copied Message</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#8993A4]" aria-hidden="true" />
                          <span>Copy Formatted Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
