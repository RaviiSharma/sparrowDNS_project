# Quick Testing Guide

## ✅ Verify Backend APIs

Open your browser or API client (Thunder Client, Postman) and test these endpoints:

### 1. Test Analytics API

```
GET http://localhost:5000/api/analytics/overview?timeRange=7d
```

Expected: JSON response with analytics data

### 2. Test Resellers API

```
GET http://localhost:5000/api/reseller/
```

Expected: JSON response with resellers list (empty array if no resellers yet)

### 3. Test Security API

```
GET http://localhost:5000/api/security/overview
```

Expected: JSON response with security overview

### 4. Test Integrations API

```
GET http://localhost:5000/api/integrations/webhooks
```

Expected: JSON response with webhooks list (empty array if no webhooks yet)

## 📝 Test from Frontend

1. **Open Analytics Page**
   - Navigate to: `http://localhost:3000/analytics`
   - Should show real data from backend (not mock data)
   - Try changing time range selector
   - Check browser console for any API errors

2. **Check Other Pages**
   - Resellers: `http://localhost:3000/resellers`
   - Security: `http://localhost:3000/security`
   - Integrations: `http://localhost:3000/integrations`
   - These still show mock data until you connect them

## 🔧 Create Test Data

### Create a Reseller

```bash
POST http://localhost:5000/api/reseller/
Content-Type: application/json

{
  "name": "Test Reseller",
  "email": "test@reseller.com",
  "userId": "YOUR_USER_ID_HERE",
  "plan": "Pro",
  "whitelabel": {
    "enabled": true,
    "customNameservers": ["ns1.test.com", "ns2.test.com"]
  }
}
```

### Create a Webhook

```bash
POST http://localhost:5000/api/integrations/webhooks
Content-Type: application/json

{
  "name": "Test Webhook",
  "url": "https://webhook.site/your-unique-url",
  "events": ["zone.created", "zone.updated"]
}
```

### Test Webhook

```bash
POST http://localhost:5000/api/integrations/webhooks/:webhookId/test
```

## 🐛 Troubleshooting

### Backend not responding?

1. Check terminal for errors
2. Verify backend is running: `http://localhost:5000`
3. Check MongoDB connection

### Frontend API errors?

1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for API calls
4. Verify CORS settings

### Authentication issues?

Make sure you're logged in. Most APIs require authentication.
Check for JWT token in cookies/localStorage.

## 📊 Expected Behavior

### Analytics Page

- Should load real data
- Time range selector should work
- Shows actual query counts and latency from database
- If no data yet, shows 0 or small numbers

### Other Pages (Not Connected Yet)

- Still show mock/static data
- Need to be connected following the pattern in Analytics page

## 🎯 Next: Connect Remaining Pages

Follow the pattern from Analytics page to connect:

1. Import the hooks from the API slice
2. Replace static data with API hooks
3. Add loading states
4. Handle errors

Example for Resellers page:

```tsx
import { useGetAllResellersQuery } from "@/store/api/resellers";

const { data, isLoading, error } = useGetAllResellersQuery();

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error loading resellers</div>;

// Use data.data to access resellers array
```

---

Happy testing! 🚀
