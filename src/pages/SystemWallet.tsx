import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';
import './SystemWallet.css';

interface Wallet {
  id: string;
  ownerId: string;
  ownerType: 'coach' | 'user' | 'system';
  ownerName: string;
  balance: number;
  totalEarned: number;
  currency: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  referenceId?: string;
  referenceType?: string;
  balanceBefore: number;
  balanceAfter: number;
  metadata?: any;
  createdAt: Date;
}

interface Coach {
  id: string;
  uid: string;
  displayName: string;
  email: string;
}


export const SystemWallet = () => {
  const [systemWallet, setSystemWallet] = useState<Wallet | null>(null);
  const [systemTransactions, setSystemTransactions] = useState<WalletTransaction[]>([]);
  
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState<string>('');
  const [coachWallet, setCoachWallet] = useState<Wallet | null>(null);
  const [coachTransactions, setCoachTransactions] = useState<WalletTransaction[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [coachLoading, setCoachLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showCashoutModal, setShowCashoutModal] = useState(false);
  const [allWallets, setAllWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    fetchSystemWallet();
    fetchCoaches();
    fetchAllWallets();
  }, []);

  const fetchAllWallets = async () => {
    try {
      const response = await api.get('/wallets');
      setAllWallets(response.data);
    } catch (error) {
      console.error('Error fetching all wallets:', error);
    }
  };

  const fetchSystemWallet = async () => {
    try {
      setLoading(true);
      const walletResponse = await api.get('/wallets/system');
      setSystemWallet(walletResponse.data);

      // Fetch transactions
      const transactionsResponse = await api.get(`/wallets/${walletResponse.data.id}/transactions`);
      setSystemTransactions(transactionsResponse.data);
    } catch (error) {
      console.error('Error fetching system wallet:', error);
      setError('Failed to load system wallet');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoaches = async () => {
    try {
      const response = await api.get('/coaches');
      console.log('👨‍🏫 Coaches data:', response.data); // Debug to see structure
      setCoaches(response.data);
    } catch (error) {
      console.error('Error fetching coaches:', error);
    }
  };

  const fetchCoachWallet = async (coachId: string) => {
    if (!coachId) {
      setCoachWallet(null);
      setCoachTransactions([]);
      return;
    }

    try {
      setCoachLoading(true);
      console.log('🔍 Fetching wallet for coach ID:', coachId); // Debug
      const walletResponse = await api.get(`/wallets/owner/${coachId}`);
      console.log('💼 Wallet response:', walletResponse.data); // Debug
      
      if (walletResponse.data) {
        setCoachWallet(walletResponse.data);
        // Fetch coach transactions
        const transactionsResponse = await api.get(`/wallets/${walletResponse.data.id}/transactions`);
        setCoachTransactions(transactionsResponse.data);
      } else {
        console.log('⚠️ No wallet found for coach'); // Debug
        setCoachWallet(null);
        setCoachTransactions([]);
      }
    } catch (error) {
      console.error('❌ Error fetching coach wallet:', error);
      setCoachWallet(null);
      setCoachTransactions([]);
    } finally {
      setCoachLoading(false);
    }
  };

  const handleCoachSelect = (coachId: string) => {
    setSelectedCoachId(coachId);
    fetchCoachWallet(coachId);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredCoaches = coaches.filter(coach =>
    coach.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="system-wallet-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading wallets...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="system-wallet-container">
          <div className="error-message">{error}</div>
        </div>
      </Layout>
    );
  }

  // Calculate total platform earnings (system + all coaches)
  const totalPlatformEarnings = allWallets.reduce((sum, wallet) => sum + wallet.totalEarned, 0);
  const totalPlatformBalance = allWallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const totalCoachesEarned = allWallets
    .filter(w => w.ownerType === 'coach')
    .reduce((sum, wallet) => sum + wallet.totalEarned, 0);
  const systemEarned = systemWallet?.totalEarned || 0;

  return (
    <Layout>
      <div className="system-wallet-container">
        <div className="wallet-header">
          <div className="wallet-title">
            <h1>💼 Wallets Management</h1>
            <p className="wallet-subtitle">View system and coach wallets, earnings, and transactions</p>
          </div>
        </div>

        {/* Total Platform Overview */}
        <div className="platform-overview">
          <div className="overview-card grand-total">
            <div className="overview-icon">🌟</div>
            <div className="overview-content">
              <h3>Total Platform Revenue</h3>
              <div className="overview-stats">
                <div className="stat-item main">
                  <span className="stat-label">All-Time Earnings</span>
                  <span className="stat-value">${totalPlatformEarnings.toFixed(2)}</span>
                </div>
                <div className="stat-breakdown">
                  <div className="breakdown-item">
                    <span className="breakdown-icon">🏢</span>
                    <span className="breakdown-label">System Share</span>
                    <span className="breakdown-value">${systemEarned.toFixed(2)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-icon">👨‍🏫</span>
                    <span className="breakdown-label">Coaches Share</span>
                    <span className="breakdown-value">${totalCoachesEarned.toFixed(2)}</span>
                  </div>
                  <div className="breakdown-item total">
                    <span className="breakdown-icon">💰</span>
                    <span className="breakdown-label">Current Balance</span>
                    <span className="breakdown-value">${totalPlatformBalance.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <p className="overview-note">Combined revenue from all subscriptions, renewals, and payments</p>
            </div>
          </div>
        </div>

        {/* System Wallet Section */}
        <div className="wallet-section">
          <div className="section-title">
            <h2>🏢 System Wallet</h2>
            <p>Main system earnings and transactions</p>
          </div>

          {systemWallet && (
            <div className="wallet-overview">
              <div className="wallet-card balance-card">
                <div className="card-icon">💰</div>
                <div className="card-content">
                  <p className="card-label">Current Balance</p>
                  <h2 className="card-value">${systemWallet.balance.toFixed(2)}</h2>
                  <p className="card-sublabel">{systemWallet.currency}</p>
                </div>
              </div>

              <div className="wallet-card earnings-card">
                <div className="card-icon">📈</div>
                <div className="card-content">
                  <p className="card-label">Total Earned (Lifetime)</p>
                  <h2 className="card-value">${systemWallet.totalEarned.toFixed(2)}</h2>
                  <p className="card-sublabel">All time</p>
                </div>
              </div>

              <div className="wallet-card transactions-card">
                <div className="card-icon">📊</div>
                <div className="card-content">
                  <p className="card-label">Total Transactions</p>
                  <h2 className="card-value">{systemTransactions.length}</h2>
                  <p className="card-sublabel">
                    {systemTransactions.filter(t => t.type === 'credit').length} credits, {systemTransactions.filter(t => t.type === 'debit').length} debits
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="transactions-section">
            <div className="section-header">
              <h3>📜 Recent Transactions</h3>
            </div>

            {systemTransactions.length === 0 ? (
              <div className="empty-state">
                <p>No transactions yet</p>
              </div>
            ) : (
              <div className="transactions-table-container">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Description</th>
                      <th>Balance After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {systemTransactions.slice(0, 10).map((transaction) => (
                      <tr key={transaction.id} className={`transaction-row ${transaction.type}`}>
                        <td className="date-cell">{formatDate(transaction.createdAt)}</td>
                        <td>
                          <span className={`type-badge ${transaction.type}`}>
                            {transaction.type === 'credit' ? '➕ Credit' : '➖ Debit'}
                          </span>
                        </td>
                        <td className={`amount-cell ${transaction.type}`}>
                          {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </td>
                        <td className="description-cell">
                          <div className="description-content">
                            <p className="description-text">{transaction.description}</p>
                            {transaction.referenceType && (
                              <span className="reference-badge">
                                {transaction.referenceType}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="balance-cell">${transaction.balanceAfter.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {systemTransactions.length > 10 && (
                  <p className="showing-info">Showing latest 10 of {systemTransactions.length} transactions</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Coach Wallets Section */}
        <div className="wallet-section coach-section">
          <div className="section-title">
            <h2>👨‍🏫 Coach Wallets</h2>
            <p>View individual coach earnings and transactions</p>
          </div>

          <div className="coach-selector">
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 Search coaches by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="coach-search-input"
              />
            </div>

            <div className="coach-dropdown">
              <label>Select Coach:</label>
              <select
                value={selectedCoachId}
                onChange={(e) => handleCoachSelect(e.target.value)}
                className="coach-select"
              >
                <option value="">-- Select a Coach --</option>
                {filteredCoaches.map((coach) => (
                  <option key={coach.id} value={coach.id}>
                    {coach.displayName || coach.email} ({coach.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {coachLoading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading coach wallet...</p>
            </div>
          )}

          {!coachLoading && selectedCoachId && !coachWallet && (
            <div className="empty-state">
              <p>This coach has no wallet yet. Wallets are created automatically when they receive their first commission.</p>
            </div>
          )}

          {!coachLoading && coachWallet && (
            <>
              <div className="wallet-overview">
                <div className="wallet-card balance-card">
                  <div className="card-icon">💰</div>
                  <div className="card-content">
                    <p className="card-label">Coach: {coachWallet.ownerName}</p>
                    <h2 className="card-value">${coachWallet.balance.toFixed(2)}</h2>
                    <p className="card-sublabel">Current Balance</p>
                  </div>
                </div>

                <div className="wallet-card earnings-card">
                  <div className="card-icon">📈</div>
                  <div className="card-content">
                    <p className="card-label">Total Earned</p>
                    <h2 className="card-value">${coachWallet.totalEarned.toFixed(2)}</h2>
                    <p className="card-sublabel">Lifetime commissions</p>
                  </div>
                </div>

                <div className="wallet-card transactions-card">
                  <div className="card-icon">📊</div>
                  <div className="card-content">
                    <p className="card-label">Transactions</p>
                    <h2 className="card-value">{coachTransactions.length}</h2>
                    <p className="card-sublabel">
                      {coachTransactions.filter(t => t.type === 'credit').length} commissions
                    </p>
                  </div>
                </div>
              </div>

              {/* Cashout Button */}
              <div className="cashout-section">
                <button
                  className="btn-cashout"
                  onClick={() => setShowCashoutModal(true)}
                  disabled={!coachWallet || coachWallet.balance <= 0}
                >
                  💸 Cashout Coach Earnings
                </button>
                {coachWallet && coachWallet.balance <= 0 && (
                  <p className="cashout-note">No balance available for cashout</p>
                )}
              </div>

              <div className="transactions-section">
                <div className="section-header">
                  <h3>📜 Transaction History</h3>
                </div>

                {coachTransactions.length === 0 ? (
                  <div className="empty-state">
                    <p>No transactions yet</p>
                  </div>
                ) : (
                  <div className="transactions-table-container">
                    <table className="transactions-table">
                      <thead>
                        <tr>
                          <th>Date & Time</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Description</th>
                          <th>Balance After</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coachTransactions.map((transaction) => (
                          <tr key={transaction.id} className={`transaction-row ${transaction.type}`}>
                            <td className="date-cell">{formatDate(transaction.createdAt)}</td>
                            <td>
                              <span className={`type-badge ${transaction.type}`}>
                                {transaction.type === 'credit' ? '➕ Credit' : '➖ Debit'}
                              </span>
                            </td>
                            <td className={`amount-cell ${transaction.type}`}>
                              {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                            </td>
                            <td className="description-cell">
                              <div className="description-content">
                                <p className="description-text">{transaction.description}</p>
                                {transaction.referenceType && (
                                  <span className="reference-badge">
                                    {transaction.referenceType}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="balance-cell">${transaction.balanceAfter.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Cashout Modal */}
        {showCashoutModal && coachWallet && (
          <CashoutModal
            wallet={coachWallet}
            onClose={() => setShowCashoutModal(false)}
            onSuccess={() => {
              setShowCashoutModal(false);
              fetchCoachWallet(selectedCoachId);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

// Cashout Modal Component
const CashoutModal = ({
  wallet,
  onClose,
  onSuccess,
}: {
  wallet: Wallet;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    walletAddress: '',
    currency: 'USDTTRC20', // Default to USDT TRC20
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amount > wallet.balance) {
      setError(`Amount cannot exceed coach's balance ($${wallet.balance.toFixed(2)})`);
      return;
    }

    if (!formData.walletAddress.trim()) {
      setError('Please enter a wallet address');
      return;
    }

    setLoading(true);

    try {
      await api.post(`/wallets/${wallet.id}/cashout`, {
        amount,
        walletAddress: formData.walletAddress.trim(),
        currency: formData.currency,
      });

      alert('✅ Cashout request submitted successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Error processing cashout:', error);
      setError(error.response?.data?.message || 'Failed to process cashout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal cashout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💸 Cashout Earnings</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>}

            <div className="cashout-info-box">
              <h3>{wallet.ownerName}</h3>
              <div className="balance-display">
                <span className="balance-label">Available Balance:</span>
                <span className="balance-amount">${wallet.balance.toFixed(2)}</span>
              </div>
            </div>

            <div className="form-group">
              <label>Amount to Cashout <span className="required">*</span></label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={wallet.balance}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Enter amount in USD"
                required
              />
              <small className="help-text">
                Maximum: ${wallet.balance.toFixed(2)}
              </small>
            </div>

            <div className="form-group">
              <label>Cryptocurrency <span className="required">*</span></label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                required
              >
                <option value="USDTTRC20">USDT (TRC20)</option>
                <option value="USDTERC20">USDT (ERC20)</option>
                <option value="btc">Bitcoin (BTC)</option>
                <option value="eth">Ethereum (ETH)</option>
              </select>
              <small className="help-text">
                Coach will receive payment in this cryptocurrency
              </small>
            </div>

            <div className="form-group">
              <label>Coach's Wallet Address <span className="required">*</span></label>
              <input
                type="text"
                value={formData.walletAddress}
                onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                placeholder="Enter coach's crypto wallet address"
                required
              />
              <small className="help-text">
                ⚠️ Double-check the address! Crypto transactions cannot be reversed.
              </small>
            </div>

            <div className="warning-box">
              <p><strong>⚠️ Important:</strong></p>
              <ul>
                <li>This will deduct ${formData.amount || '0.00'} from the coach's wallet</li>
                <li>The equivalent amount in {formData.currency} will be sent to their wallet</li>
                <li>Transaction fees may apply</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processing...' : '💸 Process Cashout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
