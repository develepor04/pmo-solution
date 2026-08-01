# PMO File Processing System - Multi-Sheet Support

## Overview

This PMO application now features **intelligent multi-sheet Excel processing** that automatically detects which sheets exist in your uploaded files and routes them to the appropriate processing algorithms.

## Supported Processing Types

### 1. EDDR Sheet Processing (App.py)
- **Sheet Name:** `EDDR`
- **Description:** EDDR Activity Timeline Tracker
- **Output:** Activity timelines with EP/LP/F/A stage tracking
- **Columns:** Activity ID, Activity Name, Stage Gate, Planned Start (EP), Planned End (LP), Actual Date (A), Duration Deviation, Timeline Flag

### 2. Project Management Sheet Processing (App2.py)
- **Sheet Name:** `Project Mangement` or `Project Management`
- **Description:** Project Management Activity Timeline Tracker
- **Output:** Similar to EDDR but tailored for Project Management sheets
- **Columns:** Activity code, Activity name, Stage gate, EP dates, LP dates, Actual dates, deviation, flag

### 3. Weekly EDDR Cont. Sheet Processing (App3.py)
- **Sheet Name:** `Weekly EDDR Cont.`
- **Description:** Weekly EDDR Continents discipline-wise milestone tracker
- **Output:** Discipline-based milestone counts (EP vs Actual)
- **Columns:** Sr, Discipline, Stage Gate, Total Deliverables, Planned (EP), Actual (A), Variance, Status

## How It Works

### Backend Architecture

```
User uploads Excel file
    ↓
UnifiedFileProcessor (file_processor.py)
    ↓
Detects available sheets
    ↓
Maps sheets to processors:
    - EDDR → EDDRProcessor (App.py)
    - Project Mangement → ProjectManagementProcessor (App2.py)
    - Weekly EDDR Cont. → WeeklyEDDRContProcessor (App3.py)
    ↓
Processes each sheet independently
    ↓
Generates separate output files for each sheet
    ↓
Returns processing results with metadata
```

### API Changes

#### Upload Endpoint Response
```json
{
  "status": "success",
  "message": "Processed 2 sheet(s) successfully",
  "job_id": "uuid-here",
  "processing_result": {
    "status": "success",
    "total_sheets": 2,
    "success_count": 2,
    "error_count": 0,
    "detected_sheets": ["EDDR", "Project Mangement"],
    "results": [
      {
        "sheet_name": "EDDR",
        "description": "EDDR Activity Timeline Tracker",
        "output_filename": "EDDR_Timeline_20260217_143025.xlsx",
        "output_path": "/path/to/output",
        "file_size": 45678,
        "status": "success",
        "processor": "EDDRProcessor"
      },
      {
        "sheet_name": "Project Mangement",
        "description": "Project Management Activity Tracker",
        "output_filename": "Project_Management_Timeline_20260217_143027.xlsx",
        "output_path": "/path/to/output",
        "file_size": 38945,
        "status": "success",
        "processor": "ProjectManagementProcessor"
      }
    ]
  }
}
```

#### Download Endpoint
- **Download all sheets as ZIP:** `GET /api/download/{job_id}`
- **Download specific sheet:** `GET /api/download/{job_id}?sheet={sheet_name}`

### Frontend Features

#### Dashboard
- Upload multiple Excel files (.xlsx, .xlsm, .xls)
- Real-time processing progress
- Detailed success/error messages showing which sheets were processed
- Automatic detection of sheet types

#### History Page
- View all processed files
- See detailed breakdown of processed sheets per job
- Expandable sheet list showing:
  - Sheet name
  - Processing status (success/error)
  - Output file size
  - Error details (if any)
- Download options:
  - Download all sheets as ZIP
  - Download individual sheets separately

## Usage Examples

### Single Sheet Processing
1. Upload an Excel file with only an "EDDR" sheet
2. System detects: 1 sheet (EDDR)
3. Processes using EDDRProcessor
4. Generates: `EDDR_Timeline_20260217.xlsx`
5. Download single file

### Multi-Sheet Processing
1. Upload an Excel file with multiple sheets:
   - EDDR
   - Project Mangement
   - Weekly EDDR Cont.
2. System detects: 3 sheets
3. Processes each with appropriate processor
4. Generates 3 output files:
   - `EDDR_Timeline_20260217_143025.xlsx`
   - `Project_Management_Timeline_20260217_143027.xlsx`
   - `Weekly_EDDR_Cont_20260217_143029.xlsx`
5. Download options:
   - Download all as ZIP
   - Download each individually

### Unrecognized Sheets
- If an Excel file contains no recognized sheets, an error is returned
- Available sheets are shown in the error message
- Users can verify their file contains the correct sheet names

## File Structure

```
data/
├── App.py                     # EDDR processor
├── App2.py                    # Project Management processor
├── App3.py                    # Weekly EDDR Cont. processor
├── file_processor.py          # NEW: Unified file processor
├── backend_server.py          # Updated: Now uses file_processor
├── uploads/                   # Input files  
├── outputs/                   # Output files organized by job_id
│   └── {job_id}/             # Each job has its own folder
│       ├── EDDR_Timeline_*.xlsx
│       ├── Project_Management_Timeline_*.xlsx
│       └── Weekly_EDDR_Cont_*.xlsx
└── frontend/
    └── src/
        ├── pages/
        │   ├── Dashboard.jsx  # Updated: Better progress feedback
        │   └── History.jsx    # Updated: Multi-sheet display
        └── services/
            └── api.js         # Updated: Support sheet-specific downloads
```

## Running the Application

### Backend
```powershell
# Start backend server
python backend_server.py
```
Server runs on: `http://localhost:5000`

### Frontend
```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```
Frontend runs on: `http://localhost:5173`

## Benefits

1. **Automatic Detection** - No need to manually specify sheet types
2. **Multi-Sheet Support** - Process multiple sheets in one upload
3. **Flexible Downloads** - Download all as ZIP or individual files
4. **Clear Feedback** - See exactly which sheets were processed successfully
5. **Error Resilience** - Partial success is supported (some sheets succeed, others fail)
6. **Scalable Architecture** - Easy to add new sheet processors

## Adding New Sheet Processors

To add a new sheet type:

1. Create processor class in a new file (e.g., `App5.py`):
```python
class MyNewProcessor:
    def __init__(self, input_file):
        self.input_file = Path(input_file)
        
    def process(self, output_file):
        # Your processing logic here
        pass
```

2. Update `file_processor.py`:
```python
from App5 import MyNewProcessor

SHEET_PROCESSORS = {
    # ... existing processors ...
    'My New Sheet': {
        'processor_class': MyNewProcessor,
        'output_suffix': 'My_New_Output',
        'description': 'My New Sheet Processor',
        'alternate_names': ['My New Sheet Alt']
    }
}
```

3. That's it! The system will automatically detect and process your new sheet type.

## Troubleshooting

### "No recognized sheets found"
- Check that your Excel file contains sheets with the exact names:
  - `EDDR`
  - `Project Mangement` (note the typo - this matches the source file)
  - `Weekly EDDR Cont.`

### Processing fails for specific sheet
- Check the error details in the History page
- Verify the sheet structure matches what the processor expects
- Look at backend console logs for detailed error traces

### Download not working
- Ensure output files exist in `outputs/{job_id}/` directory
- Check browser console for JavaScript errors
- Verify backend is running and accessible

## Future Enhancements

- [ ] Sheet preview before processing
- [ ] Custom mapping of sheet names to processors
- [ ] Batch processing multiple files simultaneously
- [ ] Export processing reports as PDF
- [ ] Real-time processing progress with WebSockets
- [ ] Support for CSV and other file formats
