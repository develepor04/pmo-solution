# Automatic Deviation Calculation System

## Overview

The PMO application now automatically calculates and detects deviations when users upload Excel files. Deviations are analyzed from processed output files and categorized by severity level.

## How It Works

### 1. **File Upload Process**

```
User Uploads File
    ↓
File Processing (via file_processor.py)
    ↓
Deviation Calculation (via deviation_calculator.py)
    ↓
Store Deviations in Database
    ↓
Send Notifications (if high-severity)
    ↓
Return Results to User
```

### 2. **Deviation Types Detected**

#### **Timeline Deviations**
- **Source**: Timeline Deviation, Project Management, EDDR sheets
- **Metrics Analyzed**:
  - Start delay (days)
  - Duration deviation (days)
  - Timeline flags
- **Severity Thresholds**:
  - Low: 1-2 days delay
  - Medium: 3-6 days delay
  - High: 7+ days delay

#### **Cost Deviations**
- **Source**: Cost vs Budget sheets
- **Metrics Analyzed**:
  - Budget vs actual cost variance
  - Percentage over/under budget
  - Cost deviation flags
- **Severity Thresholds**:
  - Low: 5-9% variance
  - Medium: 10-19% variance
  - High: 20%+ variance

#### **Quantity Deviations**
- **Source**: Quantity Deviation, Subcontract sheets
- **Metrics Analyzed**:
  - Planned vs actual quantities
  - Material/resource variance
- **Severity Thresholds**:
  - Low: 5-9% variance
  - Medium: 10-19% variance
  - High: 20%+ variance

#### **Fuel Deviations**
- **Source**: Fuel by Type (Daily) sheets
- **Metrics Analyzed**:
  - Fuel consumption by type
  - Percentage of total consumption
- **Detection**: Flags when a single fuel type exceeds 60% of total

### 3. **Database Storage**

Deviations are stored in `database/deviations.json` with the following structure:

```json
{
  "id": 1,
  "sheet": "Timeline Deviation",
  "flag": "Delay",
  "severity": "High",
  "description": "Activity A - Start delay: 10.0 days, Duration deviation: 5.0 days",
  "row_data": {
    "activity_id": "ACT001",
    "activity_name": "Foundation Work",
    "start_delay": 10.0,
    "duration_deviation": 5.0,
    "planned_start": "2026-01-01",
    "actual_start": "2026-01-11"
  },
  "detected_at": "2026-02-21T10:30:00",
  "review_status": "Pending",
  "review_reason": "",
  "user_id": "user-uuid",
  "company_id": "company-id",
  "job_id": "job-uuid",
  "filename": "project_data.xlsx"
}
```

### 4. **Notification System**

#### **Upload Notifications**
- Sent to: Admins + Managers
- Trigger: Every file upload
- Type: Info
- Contains: Filename, sheet count, user info

#### **High-Severity Deviation Notifications**
- Sent to: Admins + Managers
- Trigger: When high-severity deviations detected
- Type: Warning
- Contains: Deviation count, file info, deviation IDs

### 5. **API Response**

After upload, the API returns deviation summary:

```json
{
  "status": "success",
  "message": "Processed 3 sheet(s) successfully | 5 deviation(s) detected (2 high-severity)",
  "job_id": "uuid",
  "deviations": {
    "count": 5,
    "high_severity": 2,
    "medium_severity": 2,
    "low_severity": 1,
    "details": [
      // First 5 deviations for preview
    ]
  }
}
```

## Deviation Endpoints

### **GET /deviations**
Fetch all deviations with optional filters:

```bash
# Get all deviations
GET /deviations

# Filter by company
GET /deviations?company_id=123

# Filter by user
GET /deviations?user_id=user-uuid
```

**Response:**
```json
[
  {
    "id": 1,
    "sheet": "Timeline Deviation",
    "severity": "High",
    "description": "...",
    "review_status": "Pending"
  }
]
```

### **POST /deviations**
Create a new deviation manually:

```json
POST /deviations
{
  "sheet": "Custom Sheet",
  "flag": "Custom Flag",
  "severity": "Medium",
  "description": "Manual deviation entry",
  "row_data": {},
  "user_id": "user-uuid",
  "company_id": "company-id"
}
```

### **POST /deviations/update/:id**
Update deviation with review:

```json
POST /deviations/update/1
{
  "review_status": "Reviewed",
  "review_reason": "Approved by PM - Acceptable delay",
  "reason_type": "Approved",
  "user_id": "manager-uuid"
}
```

### **POST /api/deviation/submit**
Manager submits deviation reason (triggers admin notification):

```json
POST /api/deviation/submit
Authorization: Bearer <token>
{
  "deviation_id": "1",
  "reason": "Delay due to weather conditions",
  "type": "External",
  "sheet_name": "Timeline Deviation",
  "filename": "project_data.xlsx"
}
```

## Customizing Thresholds

Edit `deviation_calculator.py` to adjust severity thresholds:

```python
THRESHOLDS = {
    'timeline': {
        'low': 1,      # Change to adjust timeline sensitivity
        'medium': 3,
        'high': 7
    },
    'cost': {
        'low': 5,      # Percentage thresholds
        'medium': 10,
        'high': 20
    },
    'quantity': {
        'low': 5,
        'medium': 10,
        'high': 20
    },
    'fuel': {
        'low': 10,
        'medium': 20,
        'high': 30
    }
}
```

## Example Flow

1. **User uploads `project_schedule.xlsx`**
   - File contains "Project Management" sheet

2. **File Processor runs**
   - Creates `Timeline_Deviation_20260221_103000.xlsx` in outputs folder

3. **Deviation Calculator analyzes output**
   - Finds 3 activities with delays
   - Activity A: 10 days delay → High severity
   - Activity B: 4 days delay → Medium severity
   - Activity C: 2 days delay → Low severity

4. **Database Storage**
   - 3 deviation records created with IDs 1, 2, 3
   - Stored in `database/deviations.json`

5. **Notifications Sent**
   - Upload notification → All admins + managers
   - High-severity alert → All admins + managers (about Activity A)

6. **User Response**
   ```json
   {
     "status": "success",
     "message": "Processed 1 sheet successfully | 3 deviations detected (1 high-severity)",
     "deviations": {
       "count": 3,
       "high_severity": 1,
       "details": [...]
     }
   }
   ```

7. **Manager Reviews** (via theta_ai_ma-main Dashboard)
   - Views deviation in Dashboard
   - Submits reason: "Approved - Site conditions"
   - Admin receives notification

## Testing the System

### 1. **Upload a Test File**

```bash
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer <your-token>" \
  -F "file=@test_project.xlsx"
```

### 2. **Check Deviations**

```bash
curl http://localhost:5000/deviations
```

### 3. **View Notifications**

```bash
curl http://localhost:5000/api/notifications \
  -H "Authorization: Bearer <your-token>"
```

## Troubleshooting

### No deviations detected?
- Check if output files contain deviation columns (e.g., `timeline_flag`, `start_delay`)
- Verify thresholds aren't too high
- Check console logs for `[DEVIATION]` messages

### Deviations not storing?
- Verify `database/deviations.json` exists and is writable
- Check file permissions
- Review console for errors

### Notifications not sending?
- Verify users have `role` field set to `admin` or `manager`
- Check `database/notifications.json` for entries
- Ensure notification endpoints are working

## Integration with theta_ai_ma-main

The deviation tracker app (`theta_ai_ma-main`) connects to these endpoints:

- **Dashboard.jsx**: Fetches deviations via `GET /deviations`
- **submitOne/submitAll**: Submits reviews via `POST /api/deviation/submit`
- **Notification.jsx**: Displays notifications from `GET /api/notifications`

Both apps share the same backend (`backend_server.py` on port 5000).

---

**Last Updated**: 2026-02-21
**Version**: 1.0
