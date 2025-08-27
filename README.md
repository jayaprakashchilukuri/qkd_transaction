# 🔐 Quantum Banking Platform

A cutting-edge banking platform that leverages IBM Quantum computers for secure transaction processing using BB84 Quantum Key Distribution protocol.

## 🚀 Features

- **Quantum Security**: BB84 Quantum Key Distribution for unbreakable encryption
- **Real-time Processing**: IBM Quantum backend integration for instant transactions
- **Modern UI**: Beautiful, responsive web interface with quantum-themed design
- **User Management**: Secure registration, login, and session management
- **Transaction Processing**: Encrypted transaction handling with quantum keys
- **Dashboard**: Real-time monitoring of account balance and transaction history

## 🛠️ Technology Stack

### Backend
- **Flask**: Python web framework
- **MongoDB**: NoSQL database for user and transaction data
- **Qiskit**: IBM Quantum computing framework
- **IBM Quantum Runtime**: Real quantum computer access

### Frontend
- **HTML5**: Modern semantic markup
- **CSS3**: Advanced styling with gradients and animations
- **JavaScript**: Interactive frontend functionality
- **Responsive Design**: Mobile-friendly interface

### Security
- **BB84 Protocol**: Quantum key distribution implementation
- **Werkzeug**: Password hashing and security utilities
- **Session Management**: Secure user authentication
- **Quantum Encryption**: XOR encryption with quantum-generated keys

## 📋 Prerequisites

1. **Python 3.8+**
2. **MongoDB** (local installation or MongoDB Atlas)
3. **IBM Quantum Account** (for API access)

## 🔧 Installation

1. **Clone or download the project**
   ```bash
   cd finalbank
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start MongoDB**
   - Local: `mongod`
   - Or use MongoDB Atlas cloud service

4. **Configure IBM Quantum credentials**
   - The app uses the provided IBM API key and instance
   - For production, store these in environment variables

5. **Run the application**
   ```bash
   python app.py
   ```

6. **Access the platform**
   - Open browser to `http://localhost:5000`

## 🎯 Usage Guide

### 1. User Registration
- Navigate to `/signup`
- Create account with username, email, and password
- Receive $1,000 starting balance
- Automatic quantum key generation for your account

### 2. Login
- Use your credentials at `/login`
- Secure session management
- Redirect to dashboard upon success

### 3. Quantum Channel Establishment
- Click "Establish Quantum Channel" on dashboard
- Generates quantum keys using BB84 protocol
- Required before sending transactions

### 4. Send Transactions
- Enter recipient username and amount
- Transaction encrypted with quantum keys
- Real-time processing and verification
- Balance automatically updated

### 5. Monitor Activity
- View recent transactions
- Check account balance
- Monitor quantum channel status
- Real-time dashboard updates

## 🔬 Quantum Implementation

### BB84 Quantum Key Distribution
1. **Alice's Preparation**: Random bits encoded in quantum states
2. **Quantum Channel**: Qubits transmitted through quantum circuit
3. **Bob's Measurement**: Random basis measurements
4. **Sifting**: Keep bits where measurement bases match
5. **Key Generation**: Convert sifted bits to encryption key

### Transaction Flow
1. **User Registration/Login**: Authenticate user
2. **Establish Quantum Channel**: Generate quantum keys using BB84
3. **Run BB84 QKD**: Create secure communication channel
4. **Error Check**: Verify quantum key integrity
5. **User Sends Transaction**: Encrypt data with quantum key
6. **Bank Decrypts & Verifies**: Process encrypted transaction
7. **Risk Checks & Core Processing**: Validate and execute
8. **Encrypt Confirmation**: Send encrypted response
9. **Transaction Success/Fail**: Update user interface

## 🔒 Security Features

- **Quantum Key Distribution**: Theoretically unbreakable encryption
- **Password Hashing**: Werkzeug secure password storage
- **Session Management**: Flask secure sessions
- **Input Validation**: Server-side data validation
- **Error Handling**: Comprehensive error management
- **Fallback Security**: Classical encryption backup

## 🌐 API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `POST /api/establish_quantum_channel` - Create quantum channel
- `POST /api/send_transaction` - Initiate transaction
- `POST /api/process_transaction/<id>` - Process transaction
- `GET /api/user_data` - Get user dashboard data

## 🎨 UI Components

- **Gradient Backgrounds**: Modern quantum-themed design
- **Responsive Cards**: Mobile-friendly layout
- **Interactive Buttons**: Hover effects and animations
- **Status Indicators**: Real-time quantum channel status
- **Loading States**: User feedback during operations
- **Alert System**: Success/error message display

## 🔧 Configuration

### MongoDB Connection
```python
app.config["MONGO_URI"] = "mongodb://localhost:27017/quantum_bank"
```

### IBM Quantum Setup
```python
IBM_API_KEY = "your_api_key_here"
IBM_INSTANCE = "your_instance_here"
```

## 🚨 Important Notes

1. **IBM Quantum Access**: Requires valid IBM Quantum account
2. **MongoDB**: Must be running before starting the application
3. **Network**: Quantum operations require internet connectivity
4. **Fallback**: Classical encryption used if quantum backend unavailable
5. **Development**: This is a demonstration platform for educational purposes

## 🔄 Development

### Project Structure
```
finalbank/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── README.md          # Documentation
├── templates/         # HTML templates
│   ├── login.html
│   ├── signup.html
│   └── dashboard.html
└── static/           # CSS and JavaScript
    ├── style.css
    └── app.js
```

### Database Collections
- **users**: User accounts and quantum keys
- **transactions**: Transaction records
- **quantum_channels**: Active quantum communication channels

## 🎯 Future Enhancements

- Multi-factor authentication
- Advanced quantum error correction
- Real-time quantum network monitoring
- Mobile application
- Advanced analytics dashboard
- Multi-currency support

## 📞 Support

For issues or questions about the quantum banking platform, please refer to the IBM Quantum documentation or Flask framework guides.

---

**⚠️ Disclaimer**: This is a demonstration platform for educational purposes. Do not use with real financial data or in production environments without proper security audits.

# Quantum Banking Application

A secure banking application using quantum key distribution (BB84 protocol) with MongoDB backend.

## Features

- **Quantum Security**: BB84 quantum key distribution protocol
- **MongoDB Integration**: All data stored in MongoDB Atlas
- **User Authentication**: Secure signup/login system
- **Quantum Transactions**: Encrypted transactions using quantum keys
- **Real-time Dashboard**: Monitor account balance and transaction history
- **Database Access**: Admin endpoint to view stored data

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. MongoDB Configuration

The application is configured to use MongoDB Atlas with the connection string:
```
mongodb+srv://jayaprakash:jayaprakash@bb84.gwvd6qy.mongodb.net/quantumbank?retryWrites=true&w=majority&appName=BB84
```

### 3. Run the Application

```bash
python app.py
```

The application will start on `http://localhost:5000`

## Usage

### 1. Create Account
- Navigate to `/signup`
- Enter username, email, and password
- Account created with $1000 starting balance

### 2. Login
- Navigate to `/login` or `/`
- Enter your credentials

### 3. Dashboard Features
- **Establish Quantum Channel**: Required before transactions
- **Send Transactions**: Quantum-encrypted money transfers
- **View Transaction History**: Recent transaction records
- **Eavesdropper Detection**: Security monitoring

### 4. Database Access
- Navigate to `/database` to view stored data
- API endpoint: `/api/admin/database_access`

## API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `POST /api/establish_quantum_channel` - Create quantum channel
- `POST /api/send_transaction` - Send encrypted transaction
- `POST /api/process_transaction/<id>` - Process transaction
- `GET /api/user_data` - Get user data and transactions
- `GET /api/admin/database_access` - Access database collections

## MongoDB Collections

### Users Collection
```json
{
  "_id": "ObjectId",
  "username": "string",
  "email": "string", 
  "password_hash": "string",
  "quantum_key": "string",
  "balance": "number",
  "created_at": "datetime"
}
```

### Transactions Collection
```json
{
  "_id": "ObjectId",
  "user_id": "string",
  "recipient": "string",
  "amount": "number",
  "encrypted_data": "string",
  "quantum_key_id": "string",
  "status": "string",
  "timestamp": "datetime"
}
```

### Quantum Channels Collection
```json
{
  "_id": "ObjectId", 
  "user_id": "string",
  "quantum_key": "string",
  "established_at": "datetime",
  "status": "string"
}
```

## Security Features

- **Password Hashing**: Werkzeug secure password hashing
- **Quantum Key Generation**: 256-bit quantum keys
- **Data Encryption**: XOR encryption with quantum keys
- **Session Management**: Flask session handling
- **Eavesdropper Detection**: Quantum channel monitoring

## Troubleshooting

### MongoDB Connection Issues
- Ensure internet connection for MongoDB Atlas
- Check connection string credentials
- Verify network allows MongoDB connections

### Missing Dependencies
```bash
pip install --upgrade -r requirements.txt
```

### Port Already in Use
Change port in `app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=5001)
```

## Development

The application uses:
- **Flask**: Web framework
- **PyMongo**: MongoDB driver
- **Qiskit**: Quantum computing (optional)
- **Werkzeug**: Security utilities

## Testing

1. Start the application
2. Create a test account
3. Login and establish quantum channel
4. Send a test transaction
5. Check `/database` to view stored data

## Notes

- Quantum features use simulation if Qiskit hardware unavailable
- All sensitive data encrypted before storage
- Database automatically creates collections on first use
#   Q k d 2 _ t r a n s a c t i o n  
 