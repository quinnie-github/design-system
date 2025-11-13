# 🧪 Test Plan - Design System Generator v2.0

Complete testing checklist to ensure everything works correctly.

---

## 🎯 Test Overview

This test plan covers:
1. Proxy Server functionality
2. Web App UI and analysis
3. Figma Plugin import and generation
4. End-to-end workflow
5. Error handling

---

## ✅ Pre-Test Checklist

Before starting tests, verify:

- [ ] Node.js 16+ installed (`node --version`)
- [ ] Dependencies installed in proxy-server (`npm install`)
- [ ] Claude API key available
- [ ] Figma desktop app installed
- [ ] Test design screenshots ready (PNG/JPG/WebP)

---

## 📡 Test 1: Proxy Server

### 1.1 Server Startup

**Steps:**
```bash
cd proxy-server
npm start
```

**Expected:**
- ✅ Server starts without errors
- ✅ Console shows: "Server running on http://localhost:3002"
- ✅ No error messages

**Status**: [ ] Pass / [ ] Fail

---

### 1.2 Health Check Endpoint

**Steps:**
```bash
curl http://localhost:3002/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Design System Generator v2.0 Proxy Server",
  "version": "2.0.0",
  "uptime": <number>,
  "timestamp": "<ISO date>"
}
```

**Status**: [ ] Pass / [ ] Fail

---

### 1.3 API Status Endpoint

**Steps:**
```bash
curl http://localhost:3002/api/status
```

**Expected Response:**
```json
{
  "ready": true,
  "endpoints": {...},
  "limits": {...}
}
```

**Status**: [ ] Pass / [ ] Fail

---

### 1.4 Invalid Endpoint (404)

**Steps:**
```bash
curl http://localhost:3002/invalid
```

**Expected:**
- ✅ Status 404
- ✅ JSON error response with available endpoints

**Status**: [ ] Pass / [ ] Fail

---

### 1.5 CORS Headers

**Steps:**
```bash
curl -I http://localhost:3002/health
```

**Expected:**
- ✅ Header includes: `Access-Control-Allow-Origin: *`

**Status**: [ ] Pass / [ ] Fail

---

## 🌐 Test 2: Web App

### 2.1 UI Loading

**Steps:**
1. Open `web-app/index.html` in browser
2. Check all UI elements load

**Expected:**
- ✅ Title: "Design System Generator v2.0"
- ✅ API Key input field visible
- ✅ Upload section visible
- ✅ Analysis options checkboxes visible
- ✅ Analyze button visible
- ✅ No console errors

**Status**: [ ] Pass / [ ] Fail

---

### 2.2 Tab Switching

**Steps:**
1. Click "Upload File" tab
2. Click "Image URL" tab

**Expected:**
- ✅ Tab content switches correctly
- ✅ Active tab highlighted
- ✅ No errors in console

**Status**: [ ] Pass / [ ] Fail

---

### 2.3 File Upload

**Steps:**
1. Click "Drop your design screenshot here"
2. Select a PNG/JPG file

**Expected:**
- ✅ File input opens
- ✅ Image preview displays
- ✅ No errors

**Status**: [ ] Pass / [ ] Fail

---

### 2.4 Drag and Drop

**Steps:**
1. Drag a PNG/JPG file over upload area
2. Drop the file

**Expected:**
- ✅ Upload area highlights on dragover
- ✅ Image loads and preview shows
- ✅ Success message appears

**Status**: [ ] Pass / [ ] Fail

---

### 2.5 Image URL

**Steps:**
1. Switch to "Image URL" tab
2. Enter a valid image URL (e.g., from Unsplash)
3. Check preview

**Expected:**
- ✅ Image preview displays
- ✅ No errors

**Status**: [ ] Pass / [ ] Fail

---

### 2.6 API Key Validation

**Steps:**
1. Leave API key empty
2. Click "Analyze Design"

**Expected:**
- ✅ Error message: "Please enter your Claude API key"
- ✅ No API call made

**Status**: [ ] Pass / [ ] Fail

---

### 2.7 Image Required Validation

**Steps:**
1. Enter API key
2. Don't upload image
3. Click "Analyze Design"

**Expected:**
- ✅ Error message: "Please upload an image first"
- ✅ No API call made

**Status**: [ ] Pass / [ ] Fail

---

### 2.8 API Key Persistence

**Steps:**
1. Enter API key
2. Refresh page
3. Check if API key is still there

**Expected:**
- ✅ API key saved in localStorage
- ✅ API key reappears after refresh

**Status**: [ ] Pass / [ ] Fail

---

### 2.9 Analysis Options Toggle

**Steps:**
1. Uncheck all analysis options
2. Check only "Extract colors"

**Expected:**
- ✅ Checkboxes toggle correctly
- ✅ Visual feedback

**Status**: [ ] Pass / [ ] Fail

---

## 🤖 Test 3: AI Analysis

### 3.1 Successful Analysis (Simple Design)

**Test Image**: Simple landing page with clear colors

**Steps:**
1. Upload test image
2. Enter valid API key
3. Enable all analysis options
4. Click "Analyze Design"

**Expected:**
- ✅ Button shows "Analyzing..." spinner
- ✅ Status message: "Analyzing design with Claude Vision AI..."
- ✅ Response received in 10-30 seconds
- ✅ Success message: "Analysis complete! ✨"
- ✅ Results section displays
- ✅ Colors detected (at least 3-5)
- ✅ Typography detected
- ✅ JSON preview shows

**Status**: [ ] Pass / [ ] Fail

**Notes:**

---

### 3.2 Analysis Results Display

**After successful analysis, verify:**

**Colors:**
- ✅ Color swatches display correctly
- ✅ Hex values shown
- ✅ Colors categorized (primary, text, background, etc.)

**Typography:**
- ✅ Font families listed
- ✅ Font sizes shown
- ✅ Font weights displayed

**Spacing:**
- ✅ Spacing scale shown
- ✅ Values in px

**Buttons:**
- ✅ Button variants listed
- ✅ Descriptions provided

**Application Insights:**
- ✅ Type identified
- ✅ Purpose described
- ✅ Key features listed

**Status**: [ ] Pass / [ ] Fail

---

### 3.3 JSON Export

**Steps:**
1. After successful analysis
2. Click "💾 Download JSON"

**Expected:**
- ✅ File downloads
- ✅ Filename: `design-system-<timestamp>.json`
- ✅ File is valid JSON
- ✅ Contains all expected fields
- ✅ Success message appears

**Status**: [ ] Pass / [ ] Fail

---

### 3.4 Copy to Clipboard

**Steps:**
1. After successful analysis
2. Click "📋 Copy to Clipboard"

**Expected:**
- ✅ Success message: "JSON copied to clipboard! 📋"
- ✅ Can paste JSON elsewhere
- ✅ JSON is valid

**Status**: [ ] Pass / [ ] Fail

---

### 3.5 Error Handling - Invalid API Key

**Steps:**
1. Enter invalid API key (e.g., "invalid-key")
2. Upload image
3. Click "Analyze Design"

**Expected:**
- ✅ Error message displayed
- ✅ Button re-enabled after error
- ✅ Clear error description

**Status**: [ ] Pass / [ ] Fail

---

### 3.6 Error Handling - Proxy Server Down

**Steps:**
1. Stop proxy server
2. Try to analyze

**Expected:**
- ✅ Error message: "Failed to connect..."
- ✅ Button re-enabled
- ✅ No crash

**Status**: [ ] Pass / [ ] Fail

---

### 3.7 Large Image Handling

**Steps:**
1. Upload image > 5MB

**Expected:**
- ✅ Error: "Image size must be less than 5MB"
- ✅ Image not processed

**Status**: [ ] Pass / [ ] Fail

---

## 🎨 Test 4: Figma Plugin

### 4.1 Plugin Installation

**Steps:**
1. Open Figma
2. Plugins → Development → Import plugin from manifest
3. Select `figma-plugin/manifest.json`

**Expected:**
- ✅ Plugin imports successfully
- ✅ Appears in Plugins → Development menu

**Status**: [ ] Pass / [ ] Fail

---

### 4.2 Plugin UI Load

**Steps:**
1. Run plugin: Plugins → Development → Design System Generator v2.0

**Expected:**
- ✅ Plugin window opens (480x680)
- ✅ Title: "Design System Generator v2.0"
- ✅ Step 1 visible: "Import JSON"
- ✅ File upload button visible
- ✅ Textarea visible
- ✅ No errors in console

**Status**: [ ] Pass / [ ] Fail

---

### 4.3 JSON Import - File Upload

**Steps:**
1. Click "📁 Choose JSON File"
2. Select JSON file from web app
3. Click "✅ Import & Validate JSON"

**Expected:**
- ✅ File loads into textarea
- ✅ Success message: "JSON imported successfully!"
- ✅ Summary box displays
- ✅ Correct counts shown (colors, typography, etc.)
- ✅ Step 2 section appears
- ✅ "Configure & Generate" section visible

**Status**: [ ] Pass / [ ] Fail

---

### 4.4 JSON Import - Paste

**Steps:**
1. Copy JSON from web app
2. Paste into textarea
3. Click "✅ Import & Validate JSON"

**Expected:**
- ✅ Same results as file upload
- ✅ Summary accurate

**Status**: [ ] Pass / [ ] Fail

---

### 4.5 Invalid JSON Handling

**Steps:**
1. Paste invalid JSON (e.g., `{invalid}`)
2. Click "Import & Validate JSON"

**Expected:**
- ✅ Error message: "Invalid JSON: ..."
- ✅ Step 2 not shown
- ✅ No crash

**Status**: [ ] Pass / [ ] Fail

---

### 4.6 Design System Name

**Steps:**
1. After importing JSON
2. Change system name to "Test System"

**Expected:**
- ✅ Input accepts text
- ✅ Default value: "My Design System"

**Status**: [ ] Pass / [ ] Fail

---

### 4.7 Generation Options

**Steps:**
1. Toggle each checkbox:
   - Create Figma variables
   - Generate components
   - Create new page

**Expected:**
- ✅ All checkboxes toggle correctly
- ✅ Default: all checked

**Status**: [ ] Pass / [ ] Fail

---

### 4.8 Full Generation

**Steps:**
1. Import valid JSON
2. Set system name: "Test Design System"
3. Keep all options checked
4. Click "✨ Generate Design System"

**Expected:**
- ✅ Button shows "Generating..."
- ✅ Button disabled during generation
- ✅ Status message: "Starting design system generation..."
- ✅ Generation completes in 5-10 seconds
- ✅ Success message: "Design system generated successfully!"
- ✅ Figma notification appears
- ✅ Button re-enabled

**Status**: [ ] Pass / [ ] Fail

---

### 4.9 Verify Generated Assets

**After generation, check Figma:**

**New Page:**
- ✅ New page created
- ✅ Page name: "Test Design System"
- ✅ Page is current/active

**Variables:**
- ✅ Variable collection created
- ✅ Collection name matches system name
- ✅ Color variables created (color/primary/1, etc.)
- ✅ Spacing variables created (spacing/1, etc.)
- ✅ Variable values correct (colors match hex values)

**Components:**
- ✅ Container frame created: "Test Design System - Components"
- ✅ Header text with system name
- ✅ Color palette section
- ✅ Color swatches display correctly
- ✅ Button components created
- ✅ Buttons use correct colors

**Layout:**
- ✅ Everything organized vertically
- ✅ Proper spacing between sections
- ✅ Centered on canvas

**Status**: [ ] Pass / [ ] Fail

---

### 4.10 Selective Generation

**Steps:**
1. Import JSON
2. Uncheck "Generate components"
3. Generate

**Expected:**
- ✅ Variables created
- ✅ Page created
- ✅ NO components created

**Status**: [ ] Pass / [ ] Fail

---

### 4.11 Cancel Button

**Steps:**
1. Import JSON
2. Click "Cancel"

**Expected:**
- ✅ Plugin closes
- ✅ No changes to Figma file

**Status**: [ ] Pass / [ ] Fail

---

### 4.12 Error - No JSON Loaded

**Steps:**
1. Open plugin
2. Skip import step
3. Try clicking "Generate" if visible

**Expected:**
- ✅ Error message if attempted
- ✅ Generate button disabled OR proper validation

**Status**: [ ] Pass / [ ] Fail

---

## 🔄 Test 5: End-to-End Workflow

### 5.1 Complete Workflow - Simple Design

**Test Design**: Simple landing page screenshot

**Steps:**
1. Start proxy server
2. Open web app
3. Upload design screenshot
4. Analyze (30 seconds)
5. Download JSON
6. Open Figma
7. Run plugin
8. Import JSON
9. Generate system

**Expected:**
- ✅ Entire workflow completes without errors
- ✅ Total time: < 5 minutes
- ✅ Professional-looking design system in Figma
- ✅ Variables usable
- ✅ Components editable

**Status**: [ ] Pass / [ ] Fail

---

### 5.2 Complete Workflow - Complex Design

**Test Design**: Complex dashboard or e-commerce site

**Steps:**
Same as 5.1 but with complex design

**Expected:**
- ✅ Analysis takes 20-40 seconds
- ✅ More colors detected (8-12)
- ✅ More components generated
- ✅ Quality remains high

**Status**: [ ] Pass / [ ] Fail

---

### 5.3 Multiple Iterations

**Steps:**
1. Analyze design A
2. Download JSON A
3. Generate in Figma
4. WITHOUT CLOSING PLUGIN: Analyze design B
5. Download JSON B
6. Import JSON B to same plugin instance
7. Generate again

**Expected:**
- ✅ Plugin handles multiple imports
- ✅ New system created separately
- ✅ No conflicts
- ✅ No crashes

**Status**: [ ] Pass / [ ] Fail

---

## 🚨 Test 6: Error Scenarios

### 6.1 Network Timeout

**Steps:**
1. Upload very large image (close to 5MB)
2. Analyze

**Expected:**
- ✅ Proper timeout handling
- ✅ Error message if timeout
- ✅ Button re-enabled

**Status**: [ ] Pass / [ ] Fail

---

### 6.2 Malformed JSON Response

**Steps:**
Manually edit server.js to return invalid JSON, then analyze

**Expected:**
- ✅ Error caught
- ✅ User-friendly error message
- ✅ No crash

**Status**: [ ] Pass / [ ] Fail

---

### 6.3 Figma API Limits

**Steps:**
1. Generate system with 50+ colors (edit JSON manually)
2. Generate

**Expected:**
- ✅ Graceful handling of limits
- ✅ Error message if limit exceeded
- ✅ Partial generation if possible

**Status**: [ ] Pass / [ ] Fail

---

## 📊 Test Results Summary

**Date**: ___________
**Tester**: ___________

### Overall Results

- Total Tests: 42
- Passed: ___
- Failed: ___
- Success Rate: ___%

### Critical Issues Found

1.
2.
3.

### Minor Issues Found

1.
2.
3.

### Notes

---

## ✅ Production Readiness Checklist

Before considering production-ready:

- [ ] All critical tests pass (proxy, web app, plugin)
- [ ] End-to-end workflow completes successfully
- [ ] Error handling works correctly
- [ ] Documentation is complete and accurate
- [ ] No console errors during normal operation
- [ ] Performance is acceptable (< 30s for analysis)
- [ ] UI is responsive and intuitive
- [ ] Code is clean and well-commented
- [ ] Dependencies are up to date and secure

---

## 🐛 Bug Report Template

Use this template to report issues found during testing:

**Bug ID**:
**Severity**: Critical / High / Medium / Low
**Component**: Web App / Proxy Server / Figma Plugin
**Steps to Reproduce**:
1.
2.
3.

**Expected Behavior**:

**Actual Behavior**:

**Screenshots/Logs**:

**Environment**:
- OS:
- Browser:
- Node version:
- Figma version:

---

**Testing Complete!** 🎉

Use this test plan to verify all functionality before deployment.
