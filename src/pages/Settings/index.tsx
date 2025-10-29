import { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import api from '../../services/api';
import './Settings.css';

interface TelegramSettings {
  enabled: boolean;
  type: 'personal' | 'group' | 'channel';
  link: string;
  label: string;
}

interface BannerSettings {
  imageUrl: string;
  text: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  overlayEnabled: boolean;
  overlayColor: string;
  overlayOpacity: number;
}

interface AppSettings {
  telegram: TelegramSettings;
  banner: BannerSettings;
}

export const Settings = () => {
  const [settings, setSettings] = useState<AppSettings>({
    telegram: {
      enabled: false,
      type: 'group',
      link: '',
      label: 'Join our Telegram',
    },
    banner: {
      imageUrl: '',
      text: 'Welcome to Our Platform',
      textColor: '#ffffff',
      fontSize: 48,
      fontFamily: 'Inter, sans-serif',
      overlayEnabled: true,
      overlayColor: '#000000',
      overlayOpacity: 0.4,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings');
      
      // Ensure banner property exists with defaults
      const fetchedSettings = {
        ...response.data,
        banner: response.data.banner || {
          imageUrl: '',
          text: 'Welcome to Our Platform',
          textColor: '#ffffff',
          fontSize: 48,
          fontFamily: 'Inter, sans-serif',
          overlayEnabled: true,
          overlayColor: '#000000',
          overlayOpacity: 0.4,
        },
      };
      
      setSettings(fetchedSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      await api.put('/settings', settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTelegramChange = (field: keyof TelegramSettings, value: any) => {
    setSettings({
      ...settings,
      telegram: {
        ...settings.telegram,
        [field]: value,
      },
    });
  };

  const handleBannerChange = (field: keyof BannerSettings, value: any) => {
    setSettings({
      ...settings,
      banner: {
        ...settings.banner,
        [field]: value,
      },
    });
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setMessage('');

      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload/banner', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      handleBannerChange('imageUrl', response.data.url);
      setMessage('Banner image uploaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error uploading banner:', error);
      setMessage('Failed to upload banner image');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="settings-page">
          <div className="loading">Loading settings...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="settings-page">
      <div className="settings-content">
        {/* Telegram Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2>📱 Telegram Integration</h2>
            <p>Connect your Telegram account or group with users</p>
          </div>

          <div className="setting-card">
            <div className="setting-row">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={settings.telegram.enabled}
                  onChange={(e) => handleTelegramChange('enabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-text">Enable Telegram Integration</span>
              </label>
            </div>

            {settings.telegram.enabled && (
              <>
                <div className="setting-row">
                  <label>
                    Telegram Type
                    <select
                      value={settings.telegram.type}
                      onChange={(e) => handleTelegramChange('type', e.target.value as 'personal' | 'group' | 'channel')}
                    >
                      <option value="personal">Personal Account</option>
                      <option value="group">Group</option>
                      <option value="channel">Channel</option>
                    </select>
                  </label>
                </div>

                <div className="setting-row">
                  <label>
                    Telegram Link
                    <input
                      type="url"
                      value={settings.telegram.link}
                      onChange={(e) => handleTelegramChange('link', e.target.value)}
                      placeholder="https://t.me/yourusername or https://t.me/yourgroup"
                    />
                    <small className="help-text">
                      Enter your Telegram {settings.telegram.type} link. Format: https://t.me/username
                    </small>
                  </label>
                </div>

                <div className="setting-row">
                  <label>
                    Button Label
                    <input
                      type="text"
                      value={settings.telegram.label}
                      onChange={(e) => handleTelegramChange('label', e.target.value)}
                      placeholder="Join our Telegram"
                      maxLength={50}
                    />
                    <small className="help-text">
                      Text displayed on the button in user dashboard
                    </small>
                  </label>
                </div>

                {settings.telegram.link && (
                  <div className="preview-section">
                    <h4>Preview</h4>
                    <a
                      href={settings.telegram.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="telegram-button-preview"
                    >
                      <span className="telegram-icon">📱</span>
                      {settings.telegram.label}
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Banner Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2>🖼️ Landing Page Banner</h2>
            <p>Customize the banner image and text overlay for the user landing page</p>
          </div>

          <div className="setting-card">
            {/* Banner Image Upload */}
            <div className="setting-row">
              <label>
                Banner Image
                <div className="file-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerImageUpload}
                    disabled={uploading}
                    id="banner-upload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="banner-upload" className="file-upload-btn">
                    {uploading ? 'Uploading...' : 'Choose Image'}
                  </label>
                  {settings.banner.imageUrl && (
                    <span className="file-name">✓ Image uploaded</span>
                  )}
                </div>
                <small className="help-text">
                  Recommended size: 1920x600px. Max file size: 5MB. Supported formats: JPG, PNG, WebP
                </small>
              </label>
            </div>

            {/* Banner Text */}
            <div className="setting-row">
              <label>
                Banner Text
                <input
                  type="text"
                  value={settings.banner.text}
                  onChange={(e) => handleBannerChange('text', e.target.value)}
                  placeholder="Welcome to Our Platform"
                  maxLength={100}
                />
                <small className="help-text">
                  Text displayed on top of the banner image
                </small>
              </label>
            </div>

            <div className="settings-grid">
              {/* Text Color */}
              <div className="setting-row">
                <label>
                  Text Color
                  <div className="color-picker-container">
                    <input
                      type="color"
                      value={settings.banner.textColor}
                      onChange={(e) => handleBannerChange('textColor', e.target.value)}
                    />
                    <input
                      type="text"
                      value={settings.banner.textColor}
                      onChange={(e) => handleBannerChange('textColor', e.target.value)}
                      placeholder="#ffffff"
                      maxLength={7}
                      className="color-text-input"
                    />
                  </div>
                </label>
              </div>

              {/* Font Size */}
              <div className="setting-row">
                <label>
                  Font Size (px)
                  <input
                    type="number"
                    value={settings.banner.fontSize}
                    onChange={(e) => handleBannerChange('fontSize', parseInt(e.target.value) || 48)}
                    min="24"
                    max="120"
                  />
                </label>
              </div>
            </div>

            {/* Font Family */}
            <div className="setting-row">
              <label>
                Font Family
                <select
                  value={settings.banner.fontFamily}
                  onChange={(e) => handleBannerChange('fontFamily', e.target.value)}
                >
                  <option value="Inter, sans-serif">Inter (Modern Sans)</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                  <option value="Poppins, sans-serif">Poppins</option>
                  <option value="Montserrat, sans-serif">Montserrat</option>
                  <option value="Playfair Display, serif">Playfair Display (Serif)</option>
                  <option value="Georgia, serif">Georgia (Serif)</option>
                  <option value="Courier New, monospace">Courier New (Monospace)</option>
                </select>
              </label>
            </div>

            {/* Overlay Toggle */}
            <div className="setting-row">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={settings.banner.overlayEnabled}
                  onChange={(e) => handleBannerChange('overlayEnabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-text">Enable Dark Overlay</span>
              </label>
              <small className="help-text">
                Adds a dark overlay to improve text readability
              </small>
            </div>

            {settings.banner.overlayEnabled && (
              <div className="settings-grid">
                {/* Overlay Color */}
                <div className="setting-row">
                  <label>
                    Overlay Color
                    <div className="color-picker-container">
                      <input
                        type="color"
                        value={settings.banner.overlayColor}
                        onChange={(e) => handleBannerChange('overlayColor', e.target.value)}
                      />
                      <input
                        type="text"
                        value={settings.banner.overlayColor}
                        onChange={(e) => handleBannerChange('overlayColor', e.target.value)}
                        placeholder="#000000"
                        maxLength={7}
                        className="color-text-input"
                      />
                    </div>
                  </label>
                </div>

                {/* Overlay Opacity */}
                <div className="setting-row">
                  <label>
                    Overlay Opacity
                    <div className="slider-container">
                      <input
                        type="range"
                        value={settings.banner.overlayOpacity}
                        onChange={(e) => handleBannerChange('overlayOpacity', parseFloat(e.target.value))}
                        min="0"
                        max="1"
                        step="0.1"
                      />
                      <span className="slider-value">{Math.round(settings.banner.overlayOpacity * 100)}%</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Banner Preview */}
            {settings.banner.imageUrl && (
              <div className="preview-section">
                <h4>Preview</h4>
                <div className="banner-preview" style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                  <img 
                    src={settings.banner.imageUrl} 
                    alt="Banner Preview" 
                    style={{ width: '100%', height: '300px', objectFit: 'cover', display: 'block' }}
                  />
                  {settings.banner.overlayEnabled && (
                    <div 
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: settings.banner.overlayColor,
                        opacity: settings.banner.overlayOpacity,
                      }}
                    />
                  )}
                  <div 
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: settings.banner.textColor,
                      fontSize: `${settings.banner.fontSize}px`,
                      fontFamily: settings.banner.fontFamily,
                      fontWeight: 700,
                      textAlign: 'center',
                      padding: '20px',
                      width: '90%',
                    }}
                  >
                    {settings.banner.text}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="settings-actions">
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {message && (
            <span className={`save-message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </span>
          )}
        </div>
      </div>
    </div>
    </Layout>
  );
};

