# Food Banquet - Backend-Frontend Integration Fixes

## Issues Fixed

### 1. **Frontend API Service Merge Conflicts** ✅
- **Problem**: Git merge conflicts in `api.ts` and `authService.ts` were preventing proper API calls
- **Solution**: Resolved conflicts and unified the API service to use CRA proxy (`/api` → `http://localhost:5000`)

### 2. **Backend Response Format Mismatch** ✅
- **Problem**: Frontend expected `{ user: {...}, token: "..." }` but backend returned `{ _id, name, email, token }`
- **Solution**: Updated `userController.js` to return the correct response format with nested user object

### 3. **Missing User Role Support** ✅
- **Problem**: Frontend had role-based components but backend user model lacked role field
- **Solution**: Added `role` field to user model with enum values: `['donor', 'recipient', 'volunteer']`

### 4. **Missing Backend Package.json** ✅
- **Problem**: Backend had no package.json, preventing dependency installation
- **Solution**: Created complete `package.json` with all required dependencies

### 5. **Incomplete CORS Configuration** ✅
- **Problem**: Basic CORS setup didn't handle all frontend origins properly
- **Solution**: Enhanced CORS config with proper origins, credentials, and headers

### 6. **Donor Registration Form API Mismatch** ✅
- **Problem**: Form was calling non-existent `/api/donors/register` endpoint
- **Solution**: Updated to use proper `/api/users` endpoint with Redux auth actions

### 7. **Missing Environment Variables** ✅
- **Problem**: Backend would fail without proper environment setup
- **Solution**: Added fallback values for MongoDB URI and JWT secret

### 8. **Auth Token Handling Inconsistencies** ✅
- **Problem**: Different token storage methods across components
- **Solution**: Unified token handling using localStorage with proper auth service

## Files Modified

### Backend Files
- `backend1/index.js` - Enhanced CORS, error handling, health check
- `backend1/controllers/userController.js` - Fixed response format, added role support
- `backend1/models/userModel.js` - Added role field to schema
- `backend1/config/db.js` - Added fallback MongoDB URI
- `backend1/package.json` - Created with all dependencies

### Frontend Files
- `frontend/src/services/api.ts` - Resolved merge conflicts, unified API config
- `frontend/src/services/authService.ts` - Resolved merge conflicts, proper auth flow
- `frontend/src/components/auth/DonorRegisterForm.tsx` - Updated to use Redux auth actions

## API Endpoints Now Working

### Authentication
- `POST /api/users` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile (protected)

### Food Donations
- `GET /api/food-donations` - Get all donations
- `POST /api/food-donations` - Create donation (protected)
- `GET /api/food-donations/my-donations` - Get user's donations (protected)
- `PUT /api/food-donations/:id` - Update donation (protected)
- `DELETE /api/food-donations/:id` - Delete donation (protected)

### Waste Pickups
- `GET /api/waste-pickups` - Get all pickup requests
- `POST /api/waste-pickups` - Create pickup request (protected)
- `GET /api/waste-pickups/my-pickups` - Get user's pickups (protected)
- `PUT /api/waste-pickups/:id` - Update pickup request (protected)
- `DELETE /api/waste-pickups/:id` - Delete pickup request (protected)

## Setup Instructions

### 1. Install Dependencies
```bash
# Backend
cd backend1
npm install

# Frontend
cd frontend
npm install
```

### 2. Environment Setup
Create `.env` file in `backend1/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/food-banquet
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

### 3. Start Servers
```bash
# Option 1: Use batch file
start-servers.bat

# Option 2: Manual start
# Terminal 1 - Backend
cd backend1
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### 4. Test Connection
- Backend: http://localhost:5000/api
- Frontend: http://localhost:3000
- Test endpoint: http://localhost:5000/api/test

## Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (required, enum: ['donor', 'recipient', 'volunteer']),
  timestamps: true
}
```

### Food Donation Model
```javascript
{
  user: ObjectId (ref: 'User'),
  foodType: String,
  servings: String,
  description: String,
  bestBefore: String,
  allergens: [String],
  pickupInstructions: String,
  image: String,
  status: String (enum: ['available', 'reserved', 'completed', 'expired'])
}
```

### Waste Pickup Model
```javascript
{
  user: ObjectId (ref: 'User'),
  wasteType: String,
  estimatedWeight: String,
  description: String,
  preferredDate: String,
  timeSlot: String,
  pickupAddress: String,
  specialInstructions: String,
  status: String (enum: ['pending', 'scheduled', 'completed', 'cancelled'])
}
```

## Authentication Flow

1. **Registration**: User fills form → Redux action → API call → Store token/user → Redirect to dashboard
2. **Login**: User credentials → Redux action → API call → Store token/user → Redirect to dashboard
3. **Protected Routes**: Check token → API interceptor adds Authorization header → Backend validates JWT

## Next Steps

1. ✅ Install dependencies for both backend and frontend
2. ✅ Ensure MongoDB is running locally or set MONGO_URI
3. ✅ Start both servers using `start-servers.bat`
4. ✅ Test user registration and login flow
5. ✅ Verify food donation and waste pickup functionality
6. 🔄 Add more role-specific features (recipient, volunteer)
7. 🔄 Implement real-time notifications
8. 🔄 Add image upload for food donations
9. 🔄 Implement location-based matching

## Troubleshooting

### Common Issues
1. **MongoDB Connection Failed**: Ensure MongoDB is running or set correct MONGO_URI
2. **CORS Errors**: Check that frontend is running on port 3000 and backend on port 5000
3. **JWT Errors**: Ensure JWT_SECRET is set in environment variables
4. **Port Already in Use**: Kill existing processes or change ports in .env

### Debug Commands
```bash
# Test backend setup
node test-backend.js

# Check MongoDB connection
mongo food-banquet --eval "db.stats()"

# Test API endpoints
curl http://localhost:5000/api
curl http://localhost:5000/api/users
```
