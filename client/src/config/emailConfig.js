/**
 * Shared EmailJS configuration.
 * All email-sending flows should import from here.
 */
const emailConfig = {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_s94dh4c",
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_71pd49e",
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "KJXgcMPg0nMGAq2E7",
};

export default emailConfig;
