// Quantum Banking Platform Frontend JavaScript

class QuantumBankingApp {
    constructor() {
        this.quantumChannelActive = false;
        this.eavesdropperDetectionEnabled = false;
        this.eavesdropperDetected = false;
        this.transactionCount = 0;
        this.setupEventListeners();
        this.setupModalEvents();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Registration form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', this.handleRegister.bind(this));
        }

        // Quantum channel button
        const quantumChannelBtn = document.getElementById('establishQuantumChannel');
        if (quantumChannelBtn) {
            quantumChannelBtn.addEventListener('click', this.establishQuantumChannel.bind(this));
        }

        // Transaction form
        const transactionForm = document.getElementById('transactionForm');
        if (transactionForm) {
            transactionForm.addEventListener('submit', this.handleTransaction.bind(this));
        }

        // Refresh data button
        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', this.refreshDashboard.bind(this));
        }

        // Add money button
        const addMoneyBtn = document.getElementById('addMoney');
        if (addMoneyBtn) {
            addMoneyBtn.addEventListener('click', this.addMoney.bind(this));
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        this.showLoading('loginBtn', 'Logging in...');
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showModal(
                    '✅ LOGIN SUCCESSFUL',
                    '<p><strong>Welcome back!</strong></p><p>You have successfully logged into your Quantum Banking account.</p><p>Redirecting to dashboard...</p>',
                    'success'
                );
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 2000);
            } else {
                this.showModal(
                    '❌ LOGIN FAILED',
                    '<p><strong>Authentication Error!</strong></p><p>' + result.message + '</p><p>Please check your credentials and try again.</p>',
                    'error'
                );
            }
        } catch (error) {
            this.showAlert('Login failed. Please try again.', 'error');
        } finally {
            this.hideLoading('loginBtn', 'Login');
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            this.showModal(
                '❌ PASSWORD MISMATCH',
                '<p><strong>Validation Error!</strong></p><p>The passwords you entered do not match.</p><p>Please ensure both password fields contain the same value.</p>',
                'error'
            );
            return;
        }
        
        this.showLoading('registerBtn', 'Creating account...');
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showModal(
                    '✅ REGISTRATION SUCCESSFUL',
                    '<p><strong>Account Created!</strong></p><p>Your Quantum Banking account has been successfully created.</p><p>You can now login with your credentials.</p><p>Redirecting to login page...</p>',
                    'success'
                );
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2500);
            } else {
                this.showModal(
                    '❌ REGISTRATION FAILED',
                    '<p><strong>Account Creation Error!</strong></p><p>' + result.message + '</p><p>Please try again with different details.</p>',
                    'error'
                );
            }
        } catch (error) {
            this.showAlert('Registration failed. Please try again.', 'error');
        } finally {
            this.hideLoading('registerBtn', 'Create Account');
        }
    }

    async establishQuantumChannel() {
        this.showLoading('establishQuantumChannel', 'Establishing quantum channel...');
        
        try {
            const response = await fetch('/api/establish_quantum_channel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.quantumChannelActive = true;
                this.updateQuantumStatus(true);
                this.showAlert('Quantum channel established successfully!', 'success');
                
                // Enable transaction form
                const transactionForm = document.getElementById('transactionForm');
                if (transactionForm) {
                    transactionForm.style.display = 'block';
                }
            } else {
                this.showAlert(result.message, 'error');
            }
        } catch (error) {
            this.showAlert('Failed to establish quantum channel.', 'error');
        } finally {
            this.hideLoading('establishQuantumChannel', 'Establish Quantum Channel');
        }
    }

    async handleTransaction(event) {
        event.preventDefault();
        
        if (!this.quantumChannelActive) {
            this.showAlert('Please establish a quantum channel first!', 'error');
            return;
        }
        
        const recipient = document.getElementById('recipient').value;
        const amount = document.getElementById('amount').value;
        
        // Check for eavesdropper detection enabled - show detection popup first
        if (this.eavesdropperDetectionEnabled) {
            this.showEavesdropperDetectionPopup(recipient, amount);
            return;
        }
        
        this.processTransaction(recipient, amount);
    }

    showEavesdropperDetectionPopup(recipient, amount) {
        this.showModal(
            '🚨 EAVESDROPPER DETECTION ACTIVE',
            '<div class="hacker-icon" style="font-size: 4rem; margin: 20px 0;">👤💀</div><p><strong>SCANNING FOR THREATS...</strong></p><p>Checking quantum channel security before processing transaction.</p><p>Transaction: <strong>$' + amount + '</strong> to <strong>' + recipient + '</strong></p>',
            'hacker',
            () => {
                // This callback runs when close button is clicked
                this.handleEavesdropperDetectionResult(recipient, amount);
            }
        );
    }

    async handleEavesdropperDetectionResult(recipient, amount) {
        // Simulate eavesdropper detection (30% chance when enabled)
        const eavesdropperDetected = Math.random() < 0.3;
        
        if (eavesdropperDetected) {
            // Store cancelled transaction
            const encryptionKey = this.generateEncryptionKey();
            await this.storeCancelledTransaction(recipient, amount, 'Eavesdropper detected - transaction blocked', encryptionKey);
            
            // Show transaction failed popup
            this.showModal(
                '❌ TRANSACTION FAILED',
                `<div class="error-icon">🚫</div>
                <p><strong>SECURITY BREACH DETECTED!</strong></p>
                <p>Transaction to <strong>${recipient}</strong> for <strong>$${amount}</strong> has been cancelled for your security.</p>
                <p>Your funds are safe. Please try again later.</p>`,
                'error'
            );
            
            // Update transaction history
            this.loadTransactionHistory();
        } else {
            // Proceed with transaction
            this.processTransaction(recipient, amount);
        }
    }

    async processTransaction(recipient, amount) {
        this.showLoading('sendTransactionBtn', 'Processing transaction...');
        
        try {
            const response = await fetch('/api/send_transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ recipient, amount })
            });
            
            const result = await response.json();

            if (result.success) {
                this.transactionCount++;
                const encryptionKey = this.generateEncryptionKey();
                this.showQKDDemo(recipient, amount, encryptionKey);
                
                setTimeout(() => {
                    this.showModal(
                        '✅ TRANSACTION SUCCESSFUL',
                        '<p><strong>Quantum-Secured Transaction Complete!</strong></p><p>Successfully sent <strong>$' + amount + '</strong> to <strong>' + recipient + '</strong></p><p>🔐 Encryption Key: <code style="background: rgba(255,255,255,0.2); padding: 5px; border-radius: 3px; word-break: break-all;">' + encryptionKey.substring(0, 20) + '...</code></p>',
                        'success'
                    );
                }, 8500);
                
                // Process the transaction
                setTimeout(async () => {
                    await this.processTransactionBackend(result.transaction_id, encryptionKey);
                }, 2000);
                
                // Update QBER after successful transaction
                this.updateQBRAfterTransaction();
                
                // Clear form
                document.getElementById('transactionForm').reset();
            } else {
                let errorMessage = '';
                if (result.message && result.message.includes('Insufficient')) {
                    errorMessage = '<p><strong>Insufficient Funds!</strong></p><p>Your current balance is insufficient for this transaction.</p><p>Please check your account balance and try again.</p>';
                } else {
                    errorMessage = '<p><strong>Transaction Failed!</strong></p><p>' + (result.message || 'Unknown error occurred') + '</p>';
                }
                
                this.showModal(
                    '❌ TRANSACTION FAILED',
                    errorMessage,
                    'error'
                );
            }
        } catch (error) {
            this.showAlert('Transaction failed. Please try again.', 'error');
        } finally {
            this.hideLoading('sendTransactionBtn', '🚀 Send Transaction');
        }
    }

    async storeCancelledTransaction(recipient, amount, reason, encryptionKey) {
        try {
            const response = await fetch('/api/create_cancelled_transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipient: recipient,
                    amount: amount,
                    reason: reason,
                    encryption_key: encryptionKey
                })
            });
            
            const data = await response.json();
            if (!data.success) {
                console.error('Failed to store cancelled transaction:', data.message);
            }
        } catch (error) {
            console.error('Error storing cancelled transaction:', error);
        }
    }

    async processTransactionBackend(transactionId, encryptionKey) {
        try {
            const response = await fetch(`/api/process_transaction/${transactionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ encryption_key: encryptionKey })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.refreshDashboard();
            } else {
                this.showModal(
                    '❌ TRANSACTION PROCESSING FAILED',
                    '<p><strong>Processing Error!</strong></p><p>' + result.message + '</p>',
                    'error'
                );
            }
        } catch (error) {
            this.showAlert('Transaction processing error.', 'error');
        }
    }

    async addMoney() {
        try {
            const response = await fetch('/api/add_money', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount: 500 })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showAlert('$500 added to your account!', 'success');
                this.refreshDashboard();
            } else {
                this.showAlert(result.message, 'error');
            }
        } catch (error) {
            this.showAlert('Failed to add money.', 'error');
        }
    }

    async refreshDashboard() {
        try {
            const response = await fetch('/api/user_data');
            const result = await response.json();
            
            if (result.success) {
                this.updateDashboardData(result.user, result.transactions);
            }
        } catch (error) {
            console.error('Failed to refresh dashboard:', error);
        }
    }

    updateDashboardData(user, transactions) {
        // Update balance
        const balanceElement = document.getElementById('userBalance');
        if (balanceElement) {
            balanceElement.textContent = `$${user.balance.toFixed(2)}`;
        }

        // Update transaction count
        const transactionCountElement = document.getElementById('transactionCount');
        if (transactionCountElement) {
            transactionCountElement.textContent = transactions.length;
        }

        // Update recent transactions with animation
        const transactionsList = document.getElementById('recentTransactions');
        if (transactionsList) {
            transactionsList.innerHTML = '';
            
            if (transactions.length === 0) {
                transactionsList.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #666;">
                        <div style="font-size: 3rem; margin-bottom: 20px;">📭</div>
                        <h4>No transactions yet</h4>
                        <p>Establish a quantum channel and send your first secure transaction!</p>
                    </div>
                `;
            } else {
                transactions.forEach((transaction, index) => {
                    const transactionElement = this.createTransactionElement(transaction, index);
                    transactionsList.appendChild(transactionElement);
                });
            }
        }
    }

    createTransactionElement(transaction, index) {
        const div = document.createElement('div');
        div.className = 'transaction-item';
        div.style.animationDelay = `${index * 0.1}s`;
        
        const statusClass = `status-${transaction.status}`;
        const statusColor = this.getStatusColor(transaction.status);
        const encryptionKey = transaction.encryption_key || this.generateEncryptionKey();
        const transactionId = transaction._id || 'N/A';
        
        div.innerHTML = `
            <div class="transaction-header">
                <div>
                    <strong>To: ${transaction.recipient}</strong>
                    <div class="transaction-date">${new Date(transaction.timestamp).toLocaleString()}</div>
                </div>
                <div>
                    <div class="transaction-amount">-$${transaction.amount.toFixed(2)}</div>
                    <span class="transaction-status ${statusClass}" style="background-color: ${statusColor};">${transaction.status.toUpperCase()}</span>
                </div>
            </div>
            <div class="transaction-details" style="display: none; margin-top: 10px; padding: 15px; background: rgba(0,0,0,0.05); border-radius: 8px;">
                <div class="transaction-info">
                    <div><strong>Transaction ID:</strong> ${transactionId}</div>
                    <div><strong>Date:</strong> ${new Date(transaction.timestamp).toLocaleString()}</div>
                    <div><strong>From:</strong> Your Account</div>
                    <div><strong>To:</strong> ${transaction.recipient}</div>
                    <div><strong>Amount:</strong> $${transaction.amount.toFixed(2)}</div>
                </div>
                <div class="encryption-key-display" style="margin-top: 15px;">
                    <strong>🔐 Encryption Key:</strong>
                    <code class="encryption-key ${transaction.status}" style="color: ${statusColor}; background: rgba(255,255,255,0.8); padding: 8px; border-radius: 4px; display: block; margin-top: 5px; word-break: break-all; font-family: monospace;">${encryptionKey}</code>
                </div>
                ${transaction.reason ? `<div style="margin-top: 10px;"><strong>Reason:</strong> ${transaction.reason}</div>` : ''}
            </div>
        `;
        
        // Add hover and click events
        const header = div.querySelector('.transaction-header');
        const details = div.querySelector('.transaction-details');
        
        header.addEventListener('mouseenter', () => {
            details.style.display = 'block';
        });
        
        div.addEventListener('mouseleave', () => {
            details.style.display = 'none';
        });
        
        header.addEventListener('click', () => {
            details.style.display = details.style.display === 'none' ? 'block' : 'none';
        });
        
        return div;
    }

    getStatusColor(status) {
        switch(status) {
            case 'completed': return '#52c41a';
            case 'cancelled': return '#ff4d4f';
            case 'pending': return '#faad14';
            case 'failed': return '#ff4d4f';
            default: return '#d9d9d9';
        }
    }

    updateQuantumStatus(active) {
        const indicator = document.getElementById('quantumIndicator');
        const statusText = document.getElementById('quantumStatusText');
        const quantumMetrics = document.getElementById('quantumMetrics');
        
        if (indicator && statusText) {
            if (active) {
                indicator.className = 'quantum-indicator quantum-active';
                statusText.textContent = this.eavesdropperDetectionEnabled ? 'Quantum Channel Active - NOT SECURE' : 'Quantum Channel Active';
                statusText.style.color = this.eavesdropperDetectionEnabled ? '#ff4d4f' : '#4facfe';
                
                // Show quantum metrics
                if (quantumMetrics) {
                    quantumMetrics.style.display = 'block';
                    this.startQuantumMonitoring();
                }
            } else {
                indicator.className = 'quantum-indicator quantum-inactive';
                statusText.textContent = 'Quantum Channel Inactive';
                statusText.style.color = '#ccc';
                
                // Hide quantum metrics
                if (quantumMetrics) {
                    quantumMetrics.style.display = 'none';
                }
            }
        }
    }

    updateQuantumSecureText() {
        const quantumSecureElement = document.getElementById('quantumSecure');
        if (quantumSecureElement) {
            if (this.eavesdropperDetectionEnabled) {
                quantumSecureElement.innerHTML = '<span style="color: #ff4d4f; font-weight: bold;">⚠️ Eavesdropping Detected</span>';
            } else {
                quantumSecureElement.innerHTML = '<span style="color: #1890ff; font-weight: bold;">🔒 Channel Secure - No Eavesdropping Detected</span>';
            }
        }
    }

    startQuantumMonitoring() {
        // Initialize QBR monitoring
        this.updateQBR();
        setInterval(() => {
            this.updateQBR();
        }, 2000);

        // Setup eavesdropper detection toggle
        const eavesdropperToggle = document.getElementById('eavesdropperToggle');
        const eavesdropperAnimation = document.getElementById('eavesdropperAnimation');
        
        if (eavesdropperToggle && eavesdropperAnimation) {
            eavesdropperToggle.addEventListener('change', (e) => {
                this.eavesdropperDetectionEnabled = e.target.checked;
                if (e.target.checked) {
                    eavesdropperAnimation.style.display = 'block';
                    this.updateQuantumSecureText();
                } else {
                    eavesdropperAnimation.style.display = 'none';
                    this.updateQuantumSecureText();
                }
            });
        }
    }

    updateQBR() {
        // Base QBR with transaction-based adjustments
        let baseQBR = 0.02 + (Math.random() * 0.08);
        
        // Adjust based on transaction count and eavesdropper detection
        if (this.eavesdropperDetectionEnabled) {
            baseQBR += 0.05; // Higher error rate when detection enabled
        }
        
        if (this.transactionCount > 5) {
            baseQBR -= 0.01; // Better performance with more transactions
        }
        
        const qbrValue = document.getElementById('qbrValue');
        const channelStrength = document.getElementById('channelStrength');
        
        if (qbrValue) {
            qbrValue.textContent = `${baseQBR.toFixed(3)}%`;
            
            // Update channel strength based on QBR
            if (channelStrength) {
                if (baseQBR < 0.05) {
                    channelStrength.textContent = 'Excellent';
                    channelStrength.style.color = '#4facfe';
                } else if (baseQBR < 0.08) {
                    channelStrength.textContent = 'Good';
                    channelStrength.style.color = '#52c41a';
                } else if (baseQBR < 0.12) {
                    channelStrength.textContent = 'Fair';
                    channelStrength.style.color = '#faad14';
                } else {
                    channelStrength.textContent = 'Poor';
                    channelStrength.style.color = '#ff4d4f';
                }
            }
        }
    }

    updateQBRAfterTransaction() {
        this.transactionCount++;
        this.updateQBR();
    }

    updateQBRAfterThreat() {
        // Temporarily increase QBR due to security threat
        const qbrValue = document.getElementById('qbrValue');
        const channelStrength = document.getElementById('channelStrength');
        
        if (qbrValue && channelStrength) {
            qbrValue.textContent = '0.250%';
            channelStrength.textContent = 'COMPROMISED';
            channelStrength.style.color = '#ff4d4f';
            
            // Reset after 10 seconds
            setTimeout(() => {
                this.updateQBR();
            }, 10000);
        }
    }

    generateEncryptionKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let key = '';
        for (let i = 0; i < 64; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return key;
    }

    showQKDDemo(recipient, amount, encryptionKey) {
        const qkdDemo = document.getElementById('qkdDemo');
        const encryptedKeyDisplay = document.getElementById('encryptedKeyDisplay');
        const keyValue = document.getElementById('keyValue');
        const recipientNode = document.querySelector('.recipient-node div');
        
        if (qkdDemo && encryptedKeyDisplay && keyValue) {
            qkdDemo.style.display = 'block';
            recipientNode.textContent = `👥 ${recipient}`;
            
            // Show encryption key
            encryptedKeyDisplay.style.display = 'block';
            keyValue.textContent = encryptionKey;
            
            // Hide after 8 seconds
            setTimeout(() => {
                qkdDemo.style.display = 'none';
                encryptedKeyDisplay.style.display = 'none';
            }, 8000);
        }
    }

    showModal(title, message, type = 'success', onCloseCallback = null) {
        const modal = document.getElementById('transactionModal');
        const modalHeader = document.getElementById('modalHeader');
        const modalBody = document.getElementById('modalBody');
        
        if (modal && modalHeader && modalBody) {
            modal.className = `modal modal-${type}`;
            modalHeader.innerHTML = title;
            modalBody.innerHTML = message;
            modal.style.display = 'block';
            
            // Store callback for close button
            this.modalCloseCallback = onCloseCallback;
            
            // Ensure close button works
            setTimeout(() => {
                const closeButton = modal.querySelector('.modal-close');
                if (closeButton) {
                    closeButton.onclick = (e) => {
                        e.preventDefault();
                        this.closeModal();
                        return false;
                    };
                }
            }, 100);
        }
    }

    closeModal() {
        const modal = document.getElementById('transactionModal');
        if (modal) {
            modal.style.display = 'none';
            
            // Execute callback if exists
            if (this.modalCloseCallback) {
                this.modalCloseCallback();
                this.modalCloseCallback = null;
            }
            
            // Clean up event listeners
            const closeButton = modal.querySelector('.modal-close');
            if (closeButton) {
                closeButton.onclick = null;
            }
        }
    }

    // Enhanced modal events with better close functionality
    setupModalEvents() {
        const modal = document.getElementById('transactionModal');
        if (modal) {
            // Click outside modal to close
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
            
            // ESC key to close modal
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.style.display === 'block') {
                    this.closeModal();
                }
            });
        }
    }

    showAlert(message, type) {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        // Insert at the top of the main content
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(alert, container.firstChild);
        }
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    showLoading(buttonId, loadingText) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.innerHTML = `<div class="spinner"></div> ${loadingText}`;
        }
    }

    hideLoading(buttonId, originalText) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = false;
            button.textContent = originalText || button.dataset.originalText;
        }
    }

    checkAuthStatus() {
        // Check if user is authenticated on dashboard page
        if (window.location.pathname === '/dashboard') {
            this.refreshDashboard();
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuantumBankingApp();
});

// Enhanced quantum visualization effects
function addQuantumEffects() {
    const quantumElements = document.querySelectorAll('.btn-quantum, .quantum-status, .transaction-item');
    
    quantumElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.classList.add('quantum-glow');
        });
        
        element.addEventListener('mouseleave', () => {
            element.classList.remove('quantum-glow');
        });
    });
}

// Add quantum effects when page loads
document.addEventListener('DOMContentLoaded', addQuantumEffects);
