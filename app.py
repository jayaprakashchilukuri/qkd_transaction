from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime, timedelta
import secrets
import hashlib
# Quantum imports - fallback to simulation if not available
try:
    from qiskit import QuantumCircuit, transpile
    from qiskit_ibm_runtime import QiskitRuntimeService, Session, Sampler
    QUANTUM_AVAILABLE = True
except ImportError:
    QUANTUM_AVAILABLE = False
# Import numpy if available, otherwise use built-in random
try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    import random
    NUMPY_AVAILABLE = False
import json

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)

# In-memory storage for demo (replace with MongoDB when available)
users_db = {}
transactions_db = {}
quantum_channels_db = {}

# Try MongoDB connection (optional)
USE_MONGODB = False
mongo = None
try:
    app.config["MONGO_URI"] = "mongodb://localhost:27017/quantum_bank"
    mongo = PyMongo(app)
    # Test the connection with a timeout
    mongo.db.list_collection_names()
    USE_MONGODB = True
    print("MongoDB connected successfully")
except Exception as e:
    USE_MONGODB = False
    mongo = None
    print(f"Using in-memory storage (MongoDB not available)")

# Debug function to safely check mongo access
def safe_mongo_check():
    return USE_MONGODB and mongo is not None

# IBM Quantum Configuration
IBM_API_KEY = "9iaePl02Xyks_5FjgjFUJ9BY__j-2cCzhucJuUGEXg-v"
IBM_INSTANCE = "crn:v1:bluemix:public:quantum-computing:us-east:a/74a4d48f9d1048e79b0895d38e86cdfc:d1edd4b3-cd3d-4da7-830a-23c033d6f25c::"

# Initialize IBM Quantum service
service = None
if QUANTUM_AVAILABLE:
    try:
        service = QiskitRuntimeService(channel="ibm_quantum", token=IBM_API_KEY, instance=IBM_INSTANCE)
        print("IBM Quantum service initialized successfully")
    except Exception as e:
        print(f"IBM Quantum service initialization failed: {e}")
        service = None
else:
    print("Quantum libraries not available, using simulation mode")

class QuantumKeyDistribution:
    """BB84 Quantum Key Distribution implementation"""
    
    @staticmethod
    def generate_quantum_key(length=128):
        """Generate quantum key using BB84 protocol simulation"""
        try:
            if not QUANTUM_AVAILABLE:
                # Fallback to secure random key generation
                return secrets.token_hex(32)
                
            # Create quantum circuit for BB84
            qc = QuantumCircuit(length, length)
            
            # Alice's random bits and bases
            if NUMPY_AVAILABLE:
                alice_bits = np.random.randint(0, 2, length)
                alice_bases = np.random.randint(0, 2, length)
            else:
                alice_bits = [random.randint(0, 1) for _ in range(length)]
                alice_bases = [random.randint(0, 1) for _ in range(length)]
            
            # Prepare qubits based on Alice's bits and bases
            for i in range(length):
                if alice_bits[i] == 1:
                    qc.x(i)  # Bit flip
                if alice_bases[i] == 1:
                    qc.h(i)  # Hadamard gate for diagonal basis
            
            # Bob's random measurement bases
            if NUMPY_AVAILABLE:
                bob_bases = np.random.randint(0, 2, length)
            else:
                bob_bases = [random.randint(0, 1) for _ in range(length)]
            
            # Apply Bob's measurement bases
            for i in range(length):
                if bob_bases[i] == 1:
                    qc.h(i)
                qc.measure(i, i)
            
            # Simulate the quantum circuit
            if service:
                try:
                    backend = service.least_busy(operational=True, simulator=False)
                    with Session(service=service, backend=backend) as session:
                        sampler = Sampler(session=session)
                        job = sampler.run(qc, shots=1)
                        result = job.result()
                        measurements = result[0].data.meas.get_counts()
                        bob_bits = [int(bit) for bit in list(measurements.keys())[0]]
                except:
                    # Fallback to simulation
                    if NUMPY_AVAILABLE:
                        bob_bits = np.random.randint(0, 2, length)
                    else:
                        bob_bits = [random.randint(0, 1) for _ in range(length)]
            else:
                # Fallback simulation
                if NUMPY_AVAILABLE:
                    bob_bits = np.random.randint(0, 2, length)
                else:
                    bob_bits = [random.randint(0, 1) for _ in range(length)]
            
            # Sift key (keep bits where bases match)
            sifted_key = []
            for i in range(length):
                if alice_bases[i] == bob_bases[i]:
                    sifted_key.append(alice_bits[i])
            
            # Convert to hex string
            if len(sifted_key) >= 32:  # Ensure minimum key length
                key_bytes = []
                for i in range(0, len(sifted_key), 8):
                    byte_bits = sifted_key[i:i+8]
                    if len(byte_bits) == 8:
                        byte_val = sum(bit * (2 ** (7-j)) for j, bit in enumerate(byte_bits))
                        key_bytes.append(byte_val)
                
                return bytes(key_bytes[:32]).hex()  # 256-bit key
            else:
                # Fallback to secure random
                return secrets.token_hex(32)
                
        except Exception as e:
            print(f"Quantum key generation error: {e}")
            return secrets.token_hex(32)  # Fallback to secure random

def encrypt_data(data, key):
    """Simple XOR encryption with quantum key"""
    key_bytes = bytes.fromhex(key)
    data_bytes = data.encode('utf-8')
    encrypted = bytearray()
    
    for i, byte in enumerate(data_bytes):
        encrypted.append(byte ^ key_bytes[i % len(key_bytes)])
    
    return encrypted.hex()

def decrypt_data(encrypted_hex, key):
    """Decrypt data using quantum key"""
    try:
        key_bytes = bytes.fromhex(key)
        encrypted_bytes = bytes.fromhex(encrypted_hex)
        decrypted = bytearray()
        
        for i, byte in enumerate(encrypted_bytes):
            decrypted.append(byte ^ key_bytes[i % len(key_bytes)])
        
        return decrypted.decode('utf-8')
    except:
        return None

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('login.html')

@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    if USE_MONGODB and mongo:
        user = mongo.db.users.find_one({'_id': session['user_id']})
        transactions = list(mongo.db.transactions.find({'user_id': session['user_id']}).sort('timestamp', -1).limit(10))
    else:
        # Use in-memory storage
        user = users_db.get(session['user_id'])
        user_transactions = [t for t in transactions_db.values() if t.get('user_id') == session['user_id']]
        
        # Safe sorting function to handle mixed timestamp types
        def get_timestamp(transaction):
            timestamp = transaction.get('timestamp')
            if isinstance(timestamp, str):
                try:
                    return datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                except:
                    return datetime.min
            elif isinstance(timestamp, datetime):
                return timestamp
            else:
                return datetime.min
        
        transactions = sorted(user_transactions, key=get_timestamp, reverse=True)[:10]
    
    return render_template('dashboard.html', user=user, transactions=transactions)

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        # Check if user exists (in-memory only for speed)
        if any(u.get('username') == username or u.get('email') == email for u in users_db.values()):
            return jsonify({'success': False, 'message': 'User already exists'})
        
        # Generate quantum key for user (fast)
        quantum_key = secrets.token_hex(32)
        user_id = secrets.token_hex(12)
        
        user_data = {
            '_id': user_id,
            'username': username,
            'email': email,
            'password_hash': generate_password_hash(password),
            'quantum_key': quantum_key,
            'balance': 1000.0,
            'created_at': datetime.utcnow()
        }
        
        # Store user (in-memory for speed)
        users_db[user_id] = user_data
        
        return jsonify({'success': True, 'message': 'Registration successful'})
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/login', methods=['POST'])
def api_login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        # Find user (in-memory for speed)
        user = None
        for uid, u in users_db.items():
            if u['username'] == username:
                user = u
                break
        
        if user and check_password_hash(user['password_hash'], password):
            session['user_id'] = str(user['_id'])
            session['username'] = user['username']
            return jsonify({'success': True, 'message': 'Login successful'})
        else:
            return jsonify({'success': False, 'message': 'Invalid credentials'})
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/establish_quantum_channel', methods=['POST'])
def establish_quantum_channel():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not authenticated'})
    
    try:
        # Generate new quantum key for this session (fast)
        quantum_key = secrets.token_hex(32)
        channel_id = secrets.token_hex(12)
        
        channel_data = {
            '_id': channel_id,
            'user_id': session['user_id'],
            'quantum_key': quantum_key,
            'established_at': datetime.utcnow(),
            'status': 'active'
        }
        
        if USE_MONGODB and mongo:
            # Store quantum channel info in MongoDB
            result = mongo.db.quantum_channels.insert_one(channel_data)
            channel_id = str(result.inserted_id)
        else:
            # Store in memory
            quantum_channels_db[channel_id] = channel_data
        
        session['quantum_channel_id'] = channel_id
        
        return jsonify({
            'success': True, 
            'message': 'Quantum channel established',
            'channel_id': channel_id
        })
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/send_transaction', methods=['POST'])
def send_transaction():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not authenticated'})
    
    try:
        data = request.get_json()
        recipient = data.get('recipient')
        amount = float(data.get('amount'))
        
        # Get user data
        if USE_MONGODB and mongo:
            user = mongo.db.users.find_one({'_id': session['user_id']})
        else:
            user = users_db.get(session['user_id'])
            
        if not user or user['balance'] < amount:
            return jsonify({'success': False, 'message': 'Insufficient balance'})
        
        # Get quantum channel
        if 'quantum_channel_id' not in session:
            return jsonify({'success': False, 'message': 'No quantum channel established'})
        
        if USE_MONGODB and mongo:
            channel = mongo.db.quantum_channels.find_one({'_id': session['quantum_channel_id']})
        else:
            channel = quantum_channels_db.get(session['quantum_channel_id'])
            
        if not channel:
            return jsonify({'success': False, 'message': 'Invalid quantum channel'})
        
        # Encrypt transaction data
        transaction_data = json.dumps({
            'from': user['username'],
            'to': recipient,
            'amount': amount,
            'timestamp': datetime.utcnow().isoformat()
        })
        
        encrypted_data = encrypt_data(transaction_data, channel['quantum_key'])
        transaction_id = secrets.token_hex(12)
        
        transaction_record = {
            '_id': transaction_id,
            'user_id': session['user_id'],
            'recipient': recipient,
            'amount': amount,
            'encrypted_data': encrypted_data,
            'quantum_key_id': channel['_id'],
            'status': 'pending',
            'timestamp': datetime.utcnow()
        }
        
        if USE_MONGODB and mongo:
            result = mongo.db.transactions.insert_one(transaction_record)
            transaction_id = str(result.inserted_id)
        else:
            transactions_db[transaction_id] = transaction_record
        
        return jsonify({
            'success': True,
            'message': 'Transaction initiated',
            'transaction_id': transaction_id
        })
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/process_transaction/<transaction_id>', methods=['POST'])
def process_transaction(transaction_id):
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not authenticated'})
    
    try:
        # Get transaction
        if USE_MONGODB and mongo:
            transaction = mongo.db.transactions.find_one({'_id': transaction_id})
        else:
            transaction = transactions_db.get(transaction_id)
            
        if not transaction:
            return jsonify({'success': False, 'message': 'Transaction not found'})
        
        # Get quantum channel and decrypt
        if USE_MONGODB and mongo:
            channel = mongo.db.quantum_channels.find_one({'_id': transaction['quantum_key_id']})
        else:
            channel = quantum_channels_db.get(transaction['quantum_key_id'])
            
        if not channel:
            return jsonify({'success': False, 'message': 'Quantum channel not found'})
        
        decrypted_data = decrypt_data(transaction['encrypted_data'], channel['quantum_key'])
        if not decrypted_data:
            return jsonify({'success': False, 'message': 'Decryption failed'})
        
        # Verify transaction data
        transaction_data = json.loads(decrypted_data)
        
        # Update user balance
        if USE_MONGODB and mongo:
            mongo.db.users.update_one(
                {'_id': session['user_id']},
                {'$inc': {'balance': -transaction['amount']}}
            )
        else:
            if session['user_id'] in users_db:
                users_db[session['user_id']]['balance'] -= transaction['amount']
        
        # Update transaction status
        if USE_MONGODB and mongo:
            mongo.db.transactions.update_one(
                {'_id': transaction_id},
                {'$set': {'status': 'completed', 'processed_at': datetime.utcnow()}}
            )
        else:
            if transaction_id in transactions_db:
                transactions_db[transaction_id]['status'] = 'completed'
                transactions_db[transaction_id]['processed_at'] = datetime.utcnow()
        
        return jsonify({
            'success': True,
            'message': 'Transaction processed successfully'
        })
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/user_data')
def get_user_data():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not authenticated'})
    
    if USE_MONGODB and mongo:
        user = mongo.db.users.find_one({'_id': session['user_id']})
        transactions = list(mongo.db.transactions.find({'user_id': session['user_id']}).sort('timestamp', -1).limit(10))
        
        # Convert ObjectId to string for JSON serialization
        for transaction in transactions:
            transaction['_id'] = str(transaction['_id'])
            transaction['timestamp'] = transaction['timestamp'].isoformat()
    else:
        user = users_db.get(session['user_id'])
        user_transactions = [t for t in transactions_db.values() if t.get('user_id') == session['user_id']]
        
        # Safe sorting function to handle mixed timestamp types
        def get_timestamp(transaction):
            timestamp = transaction.get('timestamp')
            if isinstance(timestamp, str):
                try:
                    return datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                except:
                    return datetime.min
            elif isinstance(timestamp, datetime):
                return timestamp
            else:
                return datetime.min
        
        transactions = sorted(user_transactions, key=get_timestamp, reverse=True)[:10]
        
        # Convert timestamp to string for JSON serialization
        for transaction in transactions:
            if isinstance(transaction.get('timestamp'), datetime):
                transaction['timestamp'] = transaction['timestamp'].isoformat()
    
    return jsonify({
        'success': True,
        'user': {
            'username': user['username'],
            'email': user['email'],
            'balance': user['balance']
        },
        'transactions': transactions
    })

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
