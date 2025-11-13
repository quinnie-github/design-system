# API Key Setup Guide

## 🔑 How the API Key Works

The plugin now stores your Anthropic API key **locally in your browser** using localStorage. This means:

✅ **You only enter it once** - The key is saved for future use
✅ **It's stored locally** - Never sent anywhere except directly to Anthropic API
✅ **You can reset it** - Use the "🔑 Reset API Key" button anytime

---

## 📝 Step-by-Step Setup

### 1. Get Your Anthropic API Key

1. Go to: **https://console.anthropic.com**
2. Sign up or log in to your account
3. Click on **"API Keys"** in the sidebar
4. Click **"Create Key"**
5. Give it a name (e.g., "Figma Plugin")
6. Copy the key (starts with `sk-ant-...`)

### 2. Enter the Key in Figma Plugin

**First time using the plugin:**

1. Open Figma
2. Run: **Plugins → Development → Design System Generator**
3. Click **"📸 Upload Screenshot"**
4. Select your image
5. **A prompt will appear**: `"Enter your Anthropic API key (from https://console.anthropic.com): Your key will be saved locally for future use."`
6. Paste your API key
7. Click **OK**

✅ You'll see: `"✅ API key saved locally"`

**After first time:**

The plugin will automatically use your saved key. No prompt will appear!

---

## 🔄 Managing Your API Key

### Reset/Clear the Key

If you need to change your API key:

1. Click the **"🔑 Reset API Key"** button (next to "Upload Screenshot")
2. You'll see: `"✅ API key cleared. You'll be prompted to enter it again next time."`
3. Upload a screenshot again to enter a new key

---

## ❌ Claude Pro Subscription - Not Compatible

### Important: Claude Pro ≠ API Access

**Claude Pro** ($20/month):
- Access to claude.ai web interface
- Unlimited conversations
- Priority access during high traffic
- ❌ **DOES NOT include API access**

**API Access** (separate):
- Programmatic access via code
- Pay-per-use billing
- Required for this plugin
- ✅ **What the plugin needs**

### Why They're Separate

- **Web subscription** = For human users chatting on claude.ai
- **API access** = For developers building apps/tools

The Figma plugin makes **API calls** (direct programmatic requests), so it requires API access, not a Pro subscription.

---

## 💰 API Pricing

### How Much Does It Cost?

**Claude 3.5 Sonnet** (what the plugin uses):
- **Input**: $3.00 per million tokens (~$0.003 per 1,000 tokens)
- **Output**: $15.00 per million tokens (~$0.015 per 1,000 tokens)

### Typical Usage for Design System Generation:

**Per screenshot analysis**:
- Image: ~1,500 tokens (input)
- Prompt: ~500 tokens (input)
- Response: ~800 tokens (output)
- **Total cost per screenshot: ~$0.018 (less than 2 cents!)**

**For 100 screenshots**: ~$1.80
**For 500 screenshots**: ~$9.00

### Free Credits

New Anthropic accounts often receive **free credits** to get started!

---

## 🔒 Security & Privacy

### Where Is My API Key Stored?

**localStorage** = Browser's local storage
- Saved on your computer only
- Not sent to any server (except Anthropic when you use it)
- Cleared if you click "Reset API Key"
- Not shared across browsers/computers

### What Does the Plugin Send to Anthropic?

**Only**:
1. Your uploaded screenshot (base64 encoded)
2. The AI prompt (asking it to analyze design)
3. Your API key (for authentication)

**Nothing else!** No Figma files, no personal data, no browsing history.

---

## 🧪 Testing Your API Key

### Verify It Works:

1. Get your API key from console.anthropic.com
2. Upload any screenshot in the plugin
3. Enter your key when prompted
4. Look for status messages:
   - ✅ `"✅ API key saved locally"`
   - ✅ `"🤖 Calling Claude Vision API..."`
   - ✅ `"✅ AI analysis complete!"`

### If You See Errors:

**"❌ API request failed: 401"**
- Your API key is invalid
- Click "Reset API Key" and enter correct key

**"❌ API request failed: 429"**
- Rate limit exceeded (too many requests)
- Wait a few seconds and try again

**"❌ API key required for AI analysis"**
- You clicked "Cancel" on the prompt
- Try uploading screenshot again

---

## 🎯 Quick Reference

| Action | Button | Result |
|--------|--------|--------|
| First use | Upload Screenshot | Prompt for API key |
| Subsequent use | Upload Screenshot | No prompt (uses saved key) |
| Change key | 🔑 Reset API Key | Clears saved key |
| Get new key | https://console.anthropic.com | Create API key |

---

## 💡 Key Insights

`★ Insight ─────────────────────────────────────`

**1. localStorage vs Cookies**:
The plugin uses `localStorage` instead of cookies because it's simpler, more secure, and doesn't expire. Your key stays saved until you explicitly clear it with "Reset API Key".

**2. Client-Side API Calls**:
The plugin makes API calls directly from your browser (client-side), not through a server. This means your API key is only used on your computer and sent only to Anthropic's API servers.

**3. Cost Efficiency**:
At ~$0.02 per screenshot analysis, you can analyze 50 designs for $1. This is incredibly cost-effective compared to manual design system creation, which can take hours of designer time.

`─────────────────────────────────────────────────`

---

## 📚 Additional Resources

**Anthropic Console**: https://console.anthropic.com
**API Documentation**: https://docs.anthropic.com/
**Pricing Details**: https://www.anthropic.com/pricing
**Support**: https://support.anthropic.com

---

## ✨ Summary

1. **Get API key** from console.anthropic.com (free credits available)
2. **Enter once** when prompted after uploading screenshot
3. **Saved locally** - no need to re-enter
4. **Reset anytime** with "🔑 Reset API Key" button
5. **Cost**: ~$0.02 per analysis (very affordable)
6. **Claude Pro ≠ API** - Separate products, plugin needs API

---

**Last Updated**: 2025-11-10
**Status**: ✅ API Key Management Implemented
