import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';
import './PaymentsManagement.css';

interface PaymentSettings {
  id: string;
  provider: string;
  apiKey: string;
  ipnSecret?: string;
  isTestMode: boolean;
  isActive: boolean;
  acceptedCurrencies: string[];
  cryptoEnabled: boolean;
  cardEnabled: boolean;
  stripePublicKey?: string;
  stripeSecretKey?: string;
  lastTestedAt?: string;
  testStatus?: 'success' | 'failed';
  testMessage?: string;
}

interface PaymentStats {
  totalIncome: number;
  cryptoIncome: number;
  cardIncome: number;
  totalTransactions: number;
  cryptoTransactions: number;
  cardTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  totalExpenses: number;
  totalCashouts: number;
  netIncome: number;
}

export const PaymentsManagement = () => {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testingStripe, setTestingStripe] = useState(false);

  const [formData, setFormData] = useState({
    apiKey: '',
    ipnSecret: '',
    isTestMode: true,
    isActive: false,
    cryptoEnabled: true,
    cardEnabled: false,
    stripePublicKey: '',
    stripeSecretKey: '',
  });

  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    availableCurrencies?: string[];
    minAmount?: number;
  } | null>(null);

  const [stripeTestResult, setStripeTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchSettings();
    fetchStats();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments/settings');
      if (response.data) {
        setSettings(response.data);
        setFormData({
          apiKey: response.data.apiKey || '',
          ipnSecret: response.data.ipnSecret || '',
          isTestMode: response.data.isTestMode ?? true,
          isActive: response.data.isActive ?? false,
          cryptoEnabled: response.data.cryptoEnabled ?? true,
          cardEnabled: response.data.cardEnabled ?? false,
          stripePublicKey: response.data.stripePublicKey || '',
          stripeSecretKey: response.data.stripeSecretKey || '',
        });
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/payments/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/payments/settings', formData);
      alert('Payment settings saved successfully!');
      fetchSettings();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      alert(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!formData.apiKey) {
      alert('Please enter an API key first');
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);
      const response = await api.post('/payments/test-connection', {
        apiKey: formData.apiKey,
        isTestMode: formData.isTestMode,
      });
      setTestResult(response.data);
    } catch (error: any) {
      console.error('Error testing connection:', error);
      setTestResult({
        success: false,
        message: error.response?.data?.message || 'Connection test failed',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleTestStripe = async () => {
    if (!formData.stripeSecretKey) {
      alert('Please enter a Stripe Secret Key first');
      return;
    }

    try {
      setTestingStripe(true);
      setStripeTestResult(null);
      const response = await api.post('/payments/test-stripe', {
        secretKey: formData.stripeSecretKey,
      });
      setStripeTestResult(response.data);
    } catch (error: any) {
      console.error('Error testing Stripe connection:', error);
      setStripeTestResult({
        success: false,
        message: error.response?.data?.message || 'Stripe connection test failed',
      });
    } finally {
      setTestingStripe(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="payments-container">
          <div className="loading">Loading payment settings...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="payments-container">
        <div className="payments-header">
          <div>
            <h1>💳 Payments Management</h1>
            <p className="subtitle">Configure payment methods for your platform</p>
          </div>
        </div>

        {/* Payment Methods Toggle */}
        <div className="payment-methods-section">
          <h2>💰 Payment Methods</h2>
          <div className="payment-methods-grid">
            {/* Crypto Payments Card */}
            <div className={`payment-method-card ${formData.cryptoEnabled ? 'enabled' : 'disabled'}`}>
              <div className="method-header">
                <div className="method-icon crypto">₿</div>
                <div>
                  <h3>Cryptocurrency</h3>
                  <p>Accept USDT, BTC, ETH and more</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.cryptoEnabled}
                  onChange={(e) => setFormData({ ...formData, cryptoEnabled: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
              {formData.cryptoEnabled && (
                <div className="method-status">
                  <span className="status-badge active">✓ Active</span>
                </div>
              )}
              {stats && (
                <div className="income-display">
                  <div className="income-label">Income</div>
                  <div className="income-amount positive">${stats.cryptoIncome.toFixed(2)}</div>
                  <div className="income-transactions">{stats.cryptoTransactions} payments</div>
                </div>
              )}
            </div>

            {/* Card Payments Card */}
            <div className={`payment-method-card ${formData.cardEnabled ? 'enabled' : 'disabled'}`}>
              <div className="method-header">
                <div className="method-icon card">💳</div>
                <div>
                  <h3>Credit/Debit Card</h3>
                  <p>Accept Visa, Mastercard, Amex</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.cardEnabled}
                  onChange={(e) => setFormData({ ...formData, cardEnabled: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
              {formData.cardEnabled && (
                <div className="method-status">
                  <span className="status-badge active">✓ Active</span>
                </div>
              )}
              {stats && (
                <div className="income-display">
                  <div className="income-label">Income</div>
                  <div className="income-amount positive">${stats.cardIncome.toFixed(2)}</div>
                  <div className="income-transactions">{stats.cardTransactions} payments</div>
                </div>
              )}
            </div>
          </div>

          {/* Overall Financial Summary */}
          {stats && (
            <div className="financial-summary">
              <h2>📊 Financial Overview</h2>
              <div className="summary-cards">
                <div className="summary-card income">
                  <div className="card-icon">💰</div>
                  <div className="card-content">
                    <div className="card-label">Total Income</div>
                    <div className="card-value positive">${stats.totalIncome.toFixed(2)}</div>
                    <div className="card-sublabel">{stats.totalTransactions} total payments</div>
                  </div>
                </div>

                <div className="summary-card expenses">
                  <div className="card-icon">💸</div>
                  <div className="card-content">
                    <div className="card-label">Total Expenses</div>
                    <div className="card-value negative">${stats.totalExpenses.toFixed(2)}</div>
                    <div className="card-sublabel">{stats.totalCashouts} coach cashouts</div>
                  </div>
                </div>

                <div className="summary-card net">
                  <div className="card-icon">📈</div>
                  <div className="card-content">
                    <div className="card-label">Net Income</div>
                    <div className={`card-value ${stats.netIncome >= 0 ? 'positive' : 'negative'}`}>
                      ${stats.netIncome.toFixed(2)}
                    </div>
                    <div className="card-sublabel">
                      {stats.netIncome >= 0 ? 'Profit' : 'Loss'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cryptocurrency Settings */}
        {formData.cryptoEnabled && (
          <div className="settings-card crypto-settings">
            <div className="card-header">
              <h2>₿ Cryptocurrency Settings</h2>
              <span className="provider-badge">Powered by NOWPayments</span>
            </div>

            <div className="form-group">
              <label>
                Environment Mode <span className="required">*</span>
              </label>
              <div className="mode-toggle">
                <button
                  className={`mode-btn ${formData.isTestMode ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, isTestMode: true })}
                >
                  🧪 Test Mode (Sandbox)
                </button>
                <button
                  className={`mode-btn ${!formData.isTestMode ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, isTestMode: false })}
                >
                  🚀 Live Mode (Production)
                </button>
              </div>
              <small className="help-text">
                Always start with Test Mode to verify everything works correctly
              </small>
            </div>

            <div className="form-group">
              <label>
                NOWPayments API Key <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="Enter your NOWPayments API key"
              />
              <small className="help-text">
                Get this from{' '}
                <a href={formData.isTestMode ? 'https://sandbox.nowpayments.io' : 'https://account.nowpayments.io'} target="_blank" rel="noopener noreferrer">
                  {formData.isTestMode ? 'Sandbox' : 'Live'} Dashboard
                </a>{' '}
                → Settings → API Keys
              </small>
            </div>

            <div className="form-group">
              <label>IPN Secret (Optional)</label>
              <input
                type="text"
                className="form-input"
                value={formData.ipnSecret}
                onChange={(e) => setFormData({ ...formData, ipnSecret: e.target.value })}
                placeholder="Enter IPN secret for webhook verification"
              />
              <small className="help-text">
                Used to verify payment notifications (webhooks)
              </small>
            </div>

            <div className="action-buttons">
              <button
                className="btn-test"
                onClick={handleTestConnection}
                disabled={testing || !formData.apiKey}
              >
                {testing ? '🔄 Testing...' : '🧪 Test Connection'}
              </button>
            </div>

            {/* Test Result */}
            {testResult && (
              <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                <div className="result-icon">{testResult.success ? '✅' : '❌'}</div>
                <div className="result-content">
                  <h4>{testResult.success ? 'Connection Successful!' : 'Connection Failed'}</h4>
                  <p>{testResult.message}</p>
                  {testResult.success && testResult.availableCurrencies && (
                    <div className="result-details">
                      <p><strong>Available USDT Networks:</strong></p>
                      <div className="currency-tags">
                        {testResult.availableCurrencies.map((currency) => (
                          <span key={currency} className="currency-tag">{currency}</span>
                        ))}
                      </div>
                      {testResult.minAmount && (
                        <p><strong>Minimum Amount:</strong> ${testResult.minAmount}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Card Payment Settings */}
        {formData.cardEnabled && (
          <div className="settings-card card-settings">
            <div className="card-header">
              <h2>💳 Card Payment Settings</h2>
              <span className="provider-badge">Powered by Stripe</span>
            </div>

            <div className="info-box">
              <div className="info-icon">💡</div>
              <div>
                <h4>How to Set Up Card Payments:</h4>
                <ol>
                  <li>Create a <a href="https://stripe.com" target="_blank" rel="noopener noreferrer">Stripe account</a></li>
                  <li>Complete verification (requires business information)</li>
                  <li>Get your API keys from Stripe Dashboard → Developers → API Keys</li>
                  <li>Enter the keys below</li>
                </ol>
              </div>
            </div>

            <div className="form-group">
              <label>
                Stripe Publishable Key <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.stripePublicKey}
                onChange={(e) => setFormData({ ...formData, stripePublicKey: e.target.value })}
                placeholder="pk_test_... or pk_live_..."
              />
              <small className="help-text">
                Starts with pk_test_ (testing) or pk_live_ (production)
              </small>
            </div>

            <div className="form-group">
              <label>
                Stripe Secret Key <span className="required">*</span>
              </label>
              <input
                type="password"
                className="form-input"
                value={formData.stripeSecretKey}
                onChange={(e) => setFormData({ ...formData, stripeSecretKey: e.target.value })}
                placeholder="sk_test_... or sk_live_..."
              />
              <small className="help-text">
                Starts with sk_test_ (testing) or sk_live_ (production) - Keep this secret!
              </small>
            </div>

            <div className="action-buttons">
              <button
                className="btn-test"
                onClick={handleTestStripe}
                disabled={testingStripe || !formData.stripeSecretKey}
              >
                {testingStripe ? '🔄 Testing...' : '🧪 Test Stripe Connection'}
              </button>
            </div>

            {/* Stripe Test Result */}
            {stripeTestResult && (
              <div className={`test-result ${stripeTestResult.success ? 'success' : 'error'}`}>
                <div className="result-icon">{stripeTestResult.success ? '✅' : '❌'}</div>
                <div className="result-content">
                  <h4>{stripeTestResult.success ? 'Stripe Connection Successful!' : 'Stripe Connection Failed'}</h4>
                  <p>{stripeTestResult.message}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Global Settings */}
        <div className="settings-card global-settings">
          <h2>⚙️ Global Settings</h2>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span>Enable Payment System</span>
            </label>
            <small className="help-text">
              Users can make payments when this is enabled
            </small>
          </div>

          <div className="action-buttons">
            <button
              className="btn-save"
              onClick={handleSave}
              disabled={saving || (!formData.cryptoEnabled && !formData.cardEnabled)}
            >
              {saving ? 'Saving...' : '💾 Save All Settings'}
            </button>
          </div>
        </div>

        {/* Current Status */}
        {settings && (
          <div className="status-card">
            <h2>📊 Current Status</h2>
            <div className="status-grid">
              <div className="status-item">
                <label>System Status</label>
                <span className={`badge ${settings.isActive ? 'active' : 'inactive'}`}>
                  {settings.isActive ? '✓ Active' : '✗ Inactive'}
                </span>
              </div>
              <div className="status-item">
                <label>Cryptocurrency</label>
                <span className={`badge ${settings.cryptoEnabled ? 'active' : 'inactive'}`}>
                  {settings.cryptoEnabled ? '✓ Enabled' : '✗ Disabled'}
                </span>
              </div>
              <div className="status-item">
                <label>Card Payments</label>
                <span className={`badge ${settings.cardEnabled ? 'active' : 'inactive'}`}>
                  {settings.cardEnabled ? '✓ Enabled' : '✗ Disabled'}
                </span>
              </div>
              <div className="status-item">
                <label>Mode</label>
                <span className={`badge ${settings.isTestMode ? 'test' : 'live'}`}>
                  {settings.isTestMode ? '🧪 Test Mode' : '🚀 Live Mode'}
                </span>
              </div>
              {settings.cryptoEnabled && settings.acceptedCurrencies && (
                <div className="status-item">
                  <label>Accepted Crypto</label>
                  <div className="currency-tags">
                    {settings.acceptedCurrencies.map((currency) => (
                      <span key={currency} className="currency-tag">{currency}</span>
                    ))}
                  </div>
                </div>
              )}
              {settings.lastTestedAt && (
                <>
                  <div className="status-item">
                    <label>Last Tested</label>
                    <p>{new Date(settings.lastTestedAt).toLocaleString()}</p>
                  </div>
                  <div className="status-item">
                    <label>Test Result</label>
                    <span className={`badge ${settings.testStatus === 'success' ? 'success' : 'failed'}`}>
                      {settings.testStatus === 'success' ? '✓ Success' : '✗ Failed'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
