// Quantum Banking Platform Frontend JavaScript

class QuantumBankingApp {
    constructor() {
        this.quantumChannelActive = false;
        this.eavesdropperDetectionEnabled = false;
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
            
            // Check for eavesdropper detection enabled - block ALL transactions when enabled
            if (this.eavesdropperDetectionEnabled) {
                this.showModal(
                    '🚫 TRANSACTION BLOCKED',
                    '<p><strong>Eavesdropper Detection Active!</strong></p><p>Transaction to <strong>' + recipient + '</strong> for <strong>$' + amount + '</strong> has been blocked.</p><p>All transactions are disabled when eavesdropper detection is enabled for maximum security.</p><p>Please disable eavesdropper detection to proceed with transactions.</p>',
                    'error'
                );
                return;
            }

            if (result.success) {
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
                    await this.processTransaction(result.transaction_id);
                }, 2000);
                
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
            this.hideLoading('sendTransactionBtn', 'Send Transaction');
        }
    }

    async processTransaction(transactionId) {
        try {
            const response = await fetch(`/api/process_transaction/${transactionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
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

        // Update recent transactions
        const transactionsList = document.getElementById('recentTransactions');
        if (transactionsList) {
            transactionsList.innerHTML = '';
            
            transactions.forEach(transaction => {
                const transactionElement = this.createTransactionElement(transaction);
                transactionsList.appendChild(transactionElement);
            });
        }
    }

    createTransactionElement(transaction) {
        const div = document.createElement('div');
        div.className = 'transaction-item';
        
        const statusClass = `status-${transaction.status}`;
        
        div.innerHTML = `
            <div class="transaction-header">
                <div>
                    <strong>To: ${transaction.recipient}</strong>
                    <div class="transaction-date">${new Date(transaction.timestamp).toLocaleDateString()}</div>
                </div>
                <div>
                    <div class="transaction-amount">-$${transaction.amount.toFixed(2)}</div>
                    <span class="transaction-status ${statusClass}">${transaction.status}</span>
                </div>
            </div>
        `;
        
        return div;
    }

    updateQuantumStatus(active) {
        const indicator = document.getElementById('quantumIndicator');
        const statusText = document.getElementById('quantumStatusText');
        const quantumMetrics = document.getElementById('quantumMetrics');
        
        if (indicator && statusText) {
            if (active) {
                indicator.className = 'quantum-indicator quantum-active';
                statusText.textContent = 'Quantum Channel Active';
                statusText.style.color = '#4facfe';
                
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
                    this.startEavesdropperDetection();
                } else {
                    eavesdropperAnimation.style.display = 'none';
                    this.stopEavesdropperDetection();
                }
            });
        }
    }

    updateQBR() {
        // Simulate realistic QBR values (typically 0.01% - 0.15% for secure channels)
        const baseQBR = 0.02 + (Math.random() * 0.08);
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
                } else {
                    channelStrength.textContent = 'Fair';
                    channelStrength.style.color = '#faad14';
                }
            }
        }
    }

    startEavesdropperDetection() {
        this.eavesdropperDetected = false;
        this.eavesdropperInterval = setInterval(() => {
            // Simulate eavesdropper detection (8% chance of detection)
            const detectionStatus = document.getElementById('detectionStatus');
            const detectionDiv = detectionStatus.parentElement;
            
            if (Math.random() < 0.08) {
                // Eavesdropper detected
                this.eavesdropperDetected = true;
                detectionStatus.textContent = '⚠️ ALERT: Potential Eavesdropping Detected!';
                detectionDiv.classList.add('eavesdropper-detected');
                
                // Show hacker alert popup
                this.showHackerAlert();
                
                // Reset after 5 seconds
                setTimeout(() => {
                    this.eavesdropperDetected = false;
                    detectionStatus.textContent = '🛡️ Channel Secure - No Eavesdropping Detected';
                    detectionDiv.classList.remove('eavesdropper-detected');
                }, 5000);
            }
        }, 3000);
    }

    stopEavesdropperDetection() {
        if (this.eavesdropperInterval) {
            clearInterval(this.eavesdropperInterval);
        }
        this.eavesdropperDetected = false;
    }

    showHackerAlert() {
        this.showModal(
            '🚨 SECURITY BREACH DETECTED',
            '<div class="hacker-icon">👤💀</div><p><strong>ANONYMOUS HACKER DETECTED!</strong></p><p>Potential eavesdropping activity on quantum channel.</p><p>All transactions will be <strong style="color: #ff6b6b;">BLOCKED</strong> until channel is secure.</p>',
            'hacker'
        );
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

    showModal(title, message, type = 'success') {
        const modal = document.getElementById('transactionModal');
        const modalHeader = document.getElementById('modalHeader');
        const modalBody = document.getElementById('modalBody');
        
        if (modal && modalHeader && modalBody) {
            modal.className = `modal modal-${type}`;
            modalHeader.innerHTML = title;
            modalBody.innerHTML = message;
            modal.style.display = 'block';
        }
    }

    closeModal() {
        const modal = document.getElementById('transactionModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Add click outside modal to close
    setupModalEvents() {
        const modal = document.getElementById('transactionModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
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

// Quantum visualization effects
function addQuantumEffects() {
    const quantumElements = document.querySelectorAll('.btn-quantum, .quantum-status');
    
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
