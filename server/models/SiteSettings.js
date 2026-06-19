import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
    siteName: { type: String, default: 'AyurLife' },
    contactEmail: { type: String, default: 'support@ayurlife.com' },
    maintenanceMode: { type: Boolean, default: false },
    announcement: { type: String, default: '' },
    allowRegistrations: { type: Boolean, default: true }
}, { timestamps: true });

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
export default SiteSettings;
