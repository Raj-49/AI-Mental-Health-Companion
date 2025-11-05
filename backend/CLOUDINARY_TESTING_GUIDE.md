# 🧪 Cloudinary Image Upload Testing Guide

## Prerequisites

1. **Cloudinary Account Setup**
   - Sign up at https://cloudinary.com/
   - Get your credentials from the dashboard
   - Add to your `.env` file:
     ```env
     CLOUDINARY_CLOUD_NAME="your-cloud-name"
     CLOUDINARY_API_KEY="your-api-key"
     CLOUDINARY_API_SECRET="your-api-secret"
     ```

2. **Server Running**
   ```bash
   npm run dev
   ```

---

## 🧪 Test Cases

### Test 1: Register WITHOUT Profile Image

**Endpoint:** `POST http://localhost:3001/api/auth/register`

**Request Type:** `application/json`

**Body (JSON):**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "age": 25,
  "gender": "male"
}
```

**Expected Response (201):**
```json
{
  "message": "User registered successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "age": 25,
    "gender": "male",
    "profileImageUrl": null,
    "createdAt": "2025-11-05T...",
    "updatedAt": "2025-11-05T..."
  }
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John Doe","email":"john@example.com","password":"password123","age":25,"gender":"male"}'
```

**PowerShell Command:**
```powershell
$body = @{
    fullName = "John Doe"
    email = "john@example.com"
    password = "password123"
    age = 25
    gender = "male"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:3001/api/auth/register" -Body $body -ContentType "application/json"
```

---

### Test 2: Register WITH Profile Image

**Endpoint:** `POST http://localhost:3001/api/auth/register`

**Request Type:** `multipart/form-data`

**Body (Form Data):**
- `fullName`: Jane Doe
- `email`: jane@example.com
- `password`: password123
- `age`: 28
- `gender`: female
- `profileImage`: (select an image file)

**Expected Response (201):**
```json
{
  "message": "User registered successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "age": 28,
    "gender": "female",
    "profileImageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v.../user_profiles/...",
    "createdAt": "2025-11-05T...",
    "updatedAt": "2025-11-05T..."
  }
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -F "fullName=Jane Doe" \
  -F "email=jane@example.com" \
  -F "password=password123" \
  -F "age=28" \
  -F "gender=female" \
  -F "profileImage=@/path/to/image.jpg"
```

**PowerShell Command:**
```powershell
$form = @{
    fullName = "Jane Doe"
    email = "jane@example.com"
    password = "password123"
    age = "28"
    gender = "female"
    profileImage = Get-Item "C:\path\to\image.jpg"
}

Invoke-RestMethod -Method Post -Uri "http://localhost:3001/api/auth/register" -Form $form
```

**Postman Steps:**
1. Select `POST` method
2. Enter URL: `http://localhost:3001/api/auth/register`
3. Go to `Body` tab
4. Select `form-data`
5. Add fields:
   - `fullName` (Text): Jane Doe
   - `email` (Text): jane@example.com
   - `password` (Text): password123
   - `age` (Text): 28
   - `gender` (Text): female
   - `profileImage` (File): Browse and select image
6. Click `Send`

---

### Test 3: Login

**Endpoint:** `POST http://localhost:3001/api/auth/login`

**Request Type:** `application/json`

**Body (JSON):**
```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "age": 28,
    "gender": "female",
    "profileImageUrl": "https://res.cloudinary.com/...",
    "createdAt": "2025-11-05T...",
    "updatedAt": "2025-11-05T..."
  }
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"password123"}'
```

**Save the token from response for next tests!**

---

### Test 4: Update Profile WITHOUT New Image

**Endpoint:** `PUT http://localhost:3001/api/auth/update-profile`

**Request Type:** `multipart/form-data`

**Headers:**
- `Authorization`: `Bearer YOUR_TOKEN_HERE`

**Body (Form Data):**
- `fullName`: Jane Smith
- `age`: 29

**Expected Response (200):**
```json
{
  "message": "User profile updated successfully.",
  "user": {
    "id": 2,
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "age": 29,
    "gender": "female",
    "profileImageUrl": "https://res.cloudinary.com/...",
    "createdAt": "2025-11-05T...",
    "updatedAt": "2025-11-05T..."
  }
}
```

**cURL Command:**
```bash
curl -X PUT http://localhost:3001/api/auth/update-profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "fullName=Jane Smith" \
  -F "age=29"
```

**PowerShell Command:**
```powershell
$token = "YOUR_TOKEN_HERE"
$headers = @{
    Authorization = "Bearer $token"
}
$form = @{
    fullName = "Jane Smith"
    age = "29"
}

Invoke-RestMethod -Method Put -Uri "http://localhost:3001/api/auth/update-profile" -Headers $headers -Form $form
```

---

### Test 5: Update Profile WITH New Image

**Endpoint:** `PUT http://localhost:3001/api/auth/update-profile`

**Request Type:** `multipart/form-data`

**Headers:**
- `Authorization`: `Bearer YOUR_TOKEN_HERE`

**Body (Form Data):**
- `fullName`: Jane Smith
- `profileImage`: (select a NEW image file)

**Expected Response (200):**
```json
{
  "message": "User profile updated successfully.",
  "user": {
    "id": 2,
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "age": 29,
    "gender": "female",
    "profileImageUrl": "https://res.cloudinary.com/.../NEW_IMAGE_URL",
    "createdAt": "2025-11-05T...",
    "updatedAt": "2025-11-05T..."
  }
}
```

**cURL Command:**
```bash
curl -X PUT http://localhost:3001/api/auth/update-profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "fullName=Jane Smith" \
  -F "profileImage=@/path/to/new-image.jpg"
```

**Postman Steps:**
1. Select `PUT` method
2. Enter URL: `http://localhost:3001/api/auth/update-profile`
3. Go to `Authorization` tab → Select `Bearer Token` → Paste your token
4. Go to `Body` tab → Select `form-data`
5. Add fields:
   - `fullName` (Text): Jane Smith
   - `profileImage` (File): Browse and select new image
6. Click `Send`

---

## 🚨 Error Test Cases

### Test 6: Upload Non-Image File

**Body (Form Data):**
- `email`: test@example.com
- `password`: password123
- `profileImage`: (select a PDF or text file)

**Expected Response (400):**
```json
{
  "error": "Only image files are allowed (jpg, jpeg, png, gif, webp)."
}
```

---

### Test 7: Upload File Too Large (>5MB)

**Body (Form Data):**
- `email`: test@example.com
- `password`: password123
- `profileImage`: (select an image >5MB)

**Expected Response (400):**
```json
{
  "error": "File too large. Maximum size is 5MB."
}
```

---

### Test 8: Update Profile Without Token

**Endpoint:** `PUT http://localhost:3001/api/auth/update-profile`

**Headers:** (No Authorization header)

**Expected Response (401):**
```json
{
  "error": "Access denied. No token provided."
}
```

---

## 📊 Verification Checklist

After testing, verify:

- ✅ **Test 1**: User created without image (`profileImageUrl` is `null`)
- ✅ **Test 2**: User created with image (Cloudinary URL returned)
- ✅ **Test 3**: Login returns user with profile image URL
- ✅ **Test 4**: Profile updated without changing image (old URL preserved)
- ✅ **Test 5**: Profile updated with new image (new Cloudinary URL)
- ✅ **Test 6**: Non-image files rejected
- ✅ **Test 7**: Large files rejected
- ✅ **Test 8**: Protected route requires authentication

---

## 🔍 Check Cloudinary Dashboard

1. Log in to https://console.cloudinary.com/
2. Go to `Media Library`
3. Check the `user_profiles` folder
4. Verify uploaded images appear there

---

## 🛠️ Troubleshooting

### Issue: "Cloudinary configuration not found"
**Solution:** Check `.env` file has correct Cloudinary credentials

### Issue: "MulterError: Unexpected field"
**Solution:** Ensure form field name is exactly `profileImage` (case-sensitive)

### Issue: "Image upload failed"
**Solution:** 
- Check internet connection
- Verify Cloudinary credentials are correct
- Check Cloudinary dashboard for quota limits

### Issue: "Token expired"
**Solution:** Login again to get a new token

---

## 📝 Notes

- Images are stored in Cloudinary under `user_profiles` folder
- Each upload gets a unique filename
- Old images are NOT automatically deleted (consider cleanup strategy)
- Maximum file size: 5MB
- Supported formats: JPG, JPEG, PNG, GIF, WEBP
- Multer uses memory storage (suitable for Vercel)
