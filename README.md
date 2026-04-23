# React Form App

A responsive React form that captures user data including geolocation and submits to Google Sheets.

## Setup

1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Build for production: `npm run build`

## Google Sheets Integration

To connect to Google Sheets:

1. Create a new Google Apps Script project.
2. Add the following code to Code.gs:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getSheetByName('Sheet1');
  var data = e.parameter;
  sheet.appendRow([data.name, data.email, data.message, data.phone, data.latitude, data.longitude]);
  return ContentService.createTextOutput('Success');
}
```

3. Deploy as web app and get the URL.
4. Replace 'YOUR_APPS_SCRIPT_URL_HERE' in App.jsx with the URL.

## Features

- Responsive design
- Geolocation capture
- Form validation
- Submission to Google Sheets