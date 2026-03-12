# FCA Baking Website — Setup Guide

The order form POSTs **directly to your Google Apps Script**. No FormSubmit. The Script handles Sheet logging, emails to you and the customer, and redirect. Works from file://, localhost, or GitHub Pages.

---

## 1. Google Sheet + Apps Script (Required)

### A. Create the Google Sheet

1. Create a new [Google Sheet](https://sheets.google.com).
2. Add these column headers in row 1:
   - `Order ID` | `Timestamp` | `First Name` | `Last Name` | `Phone` | `Email` | `Address` | `Vanilla Qty` | `Chocolate Qty` | `Total` | `Payment` | `Primary Contact` | `Raw Data`

### B. Add the Apps Script

1. In the Sheet: **Extensions → Apps Script**.
2. **Delete all existing code** and paste the script below.
3. Click **Save** (disk icon).
4. **Deploy → New deployment** (or **Manage deployments → Edit → New version** if you already have one).
5. Click the gear icon next to "Select type" → **Web app**.
6. Set **Who has access** to **Anyone**.
7. Click **Deploy**. Copy the URL if creating new; existing deployments keep the same URL.

```javascript
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function parseFormData(contents, contentType) {
  if (!contents) return {};
  if ((contentType || '').indexOf('json') >= 0) {
    var data = JSON.parse(contents);
    return data.form_data || data;
  }
  var fd = {};
  contents.split('&').forEach(function(pair) {
    var idx = pair.indexOf('=');
    var k = idx >= 0 ? pair.substring(0, idx) : pair;
    var v = '';
    if (idx >= 0) {
      try { v = decodeURIComponent(pair.substring(idx + 1).replace(/\+/g, ' ')); } catch (e) {}
    }
    fd[k] = v;
  });
  return fd;
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var contentType = e.postData ? (e.postData.type || '') : '';
    var contents = e.postData ? (e.postData.contents || '') : '';
    var fd = parseFormData(contents, contentType);

    var vanilla = parseInt(fd.vanilla_qty || 0, 10);
    var chocolate = parseInt(fd.chocolate_qty || 0, 10);
    var total = (vanilla + chocolate) * 3;
    var orderId = fd.order_id || '';
    var primaryContact = fd.primary_contact || 'email';

    sheet.appendRow([
      orderId,
      new Date(),
      fd.first_name || '',
      fd.last_name || '',
      fd.phone || '',
      fd.email || '',
      fd.address || '',
      vanilla,
      chocolate,
      total,
      fd.payment || '',
      primaryContact,
      JSON.stringify(fd)
    ]);

    var businessEmail = 'atemakuei.work@gmail.com';
    var orderSummary = 'Order ' + orderId + ': ' + vanilla + ' vanilla, ' + chocolate + ' chocolate = $' + total + '\n' +
      'Customer: ' + (fd.first_name || '') + ' ' + (fd.last_name || '') + '\n' +
      'Email: ' + (fd.email || '') + ' | Phone: ' + (fd.phone || '') + '\n' +
      'Address: ' + (fd.address || '') + '\n' +
      'Payment: ' + (fd.payment || '');
    MailApp.sendEmail(businessEmail, 'FCA Baking Order ' + orderId, orderSummary);

    var confirmMsg = 'Thanks for your order! Order ID: ' + orderId + '. We\'ll reach out shortly to confirm.';
    if (primaryContact === 'email' && fd.email) {
      var htmlBody = '<div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #faf6f0; border-radius: 12px;">' +
        '<h2 style="color: #3d2314; margin-bottom: 8px;">¡Gracias!</h2>' +
        '<p style="color: #7b4f2d; font-size: 18px; margin-bottom: 20px;">Thanks for your order, ' + (fd.first_name || 'there') + '! We\'re so excited to bake for you.</p>' +
        '<div style="background: #fff; padding: 16px; border-radius: 8px; border-left: 4px solid #c97b8b; margin-bottom: 20px;">' +
        '<p style="margin: 0 0 8px 0; font-weight: bold; color: #3d2314;">Order ID</p>' +
        '<p style="margin: 0; font-size: 20px; color: #8b6914; letter-spacing: 1px;">' + orderId + '</p>' +
        '</div>' +
        '<div style="background: #fff; padding: 16px; border-radius: 8px; margin-bottom: 20px;">' +
        '<p style="margin: 0 0 8px 0; font-weight: bold; color: #3d2314;">Order Details</p>' +
        '<p style="margin: 0 0 4px 0; color: #7b4f2d;">' + vanilla + ' vanilla concha(s)</p>' +
        '<p style="margin: 0 0 4px 0; color: #7b4f2d;">' + chocolate + ' chocolate concha(s)</p>' +
        '<p style="margin: 8px 0 0 0; font-weight: bold; color: #3d2314;">Total: $' + total + '</p>' +
        '</div>' +
        '<div style="background: #fff; padding: 16px; border-radius: 8px; margin-bottom: 20px;">' +
        '<p style="margin: 0 0 8px 0; font-weight: bold; color: #3d2314;">Delivery Address</p>' +
        '<p style="margin: 0; color: #7b4f2d; line-height: 1.5;">' + (fd.address || '—').replace(/\n/g, '<br>') + '</p>' +
        '<p style="margin: 8px 0 0 0; color: #7b4f2d;">Payment: ' + (fd.payment || '—') + '</p>' +
        '</div>' +
        '<p style="color: #3d2314; line-height: 1.6;">We\'ll reach out shortly to confirm the details and arrange delivery. Payment is collected when we deliver your fresh conchas.</p>' +
        '<p style="color: #7b4f2d; margin-top: 20px; font-size: 14px;">Reply to this email for any further questions or concerns — we\'re happy to help!</p>' +
        '<p style="color: #7b4f2d; margin-top: 24px; font-size: 14px;">— FCA Baking<br>Authentic conchas in Manhattan, KS</p>' +
        '</div>';
      MailApp.sendEmail(fd.email, 'FCA Baking — Order ' + orderId + ' confirmed!', confirmMsg, { htmlBody: htmlBody, replyTo: businessEmail });
    } else if (primaryContact === 'text' && fd.phone) {
      var phone = (fd.phone + '').replace(/\D/g, '');
      if (phone.length >= 10) {
        MailApp.sendEmail(phone + '@text.email', 'FCA Baking Order ' + orderId, confirmMsg);
      }
    }

    var base = (fd.redirect_base || '').replace(/\/$/, '');
    var redirectUrl = base ? (base + 'order-thanks.html?order_id=' + encodeURIComponent(orderId)) : ('order-thanks.html?order_id=' + encodeURIComponent(orderId));
    var html = '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=' + redirectUrl + '"></head><body><p>Order received! Redirecting...</p><p><a href="' + redirectUrl + '">Click here if not redirected</a></p></body></html>';
    return ContentService.createTextOutput(html).setMimeType(ContentService.MimeType.HTML);
  } catch (err) {
    var errHtml = '<!DOCTYPE html><html><body><p>Error: ' + err.toString().replace(/</g, '&lt;') + '</p><a href="order.html">Back to order form</a></body></html>';
    return ContentService.createTextOutput(errHtml).setMimeType(ContentService.MimeType.HTML);
  }
}
```

### C. Update the Form URL (if needed)

The form in `order.html` is set to your Script URL. If you use a different Sheet/Script, update the form `action` in `order.html` to match your deployed URL.

### D. Privacy & Security

- **Sheet is not exposed:** The Script URL is public (it's in your form), but it does not expose your Sheet. Visitors cannot view or browse your Sheet — they can only submit data through the form, which your Script processes.
- **Abuse risk:** Anyone who finds the Script URL could POST fake orders. The form has a honeypot field (`_honey`) to catch simple bots. For stronger protection, consider adding reCAPTCHA or similar.
- **Keep the Sheet private:** In Google Sheets, set sharing to **Restricted** (only you). The Script runs as you and can write to the Sheet; visitors cannot access it directly.

---

## 2. Expense Tracking (Optional)

Order tracking and expense tracking are for **you**, not customers. Keep your sheets private.

### Expense Sheet

For expenses, use a separate Google Sheet:

1. Create a new Sheet (e.g. ?FCA Baking Expenses?).
2. Add columns such as: `Date` | `Category` | `Description` | `Amount` | `Notes`.
3. **Bookmark the Sheet URL** in your browser for quick access.
4. **Do not add a link to the website** ? that would expose it to anyone and could let visitors find or abuse it.

### Protecting Your Sheets

- Keep the Sheet sharing set to **Restricted**.
- **Expense Sheet:** Same rule. Bookmark it; do not link it on the site.

---

## 3. GitHub Pages Deployment

1. Create a new repository on GitHub (e.g. `FCABaking`).
2. Push this project to the repo.
3. Go to **Settings → Pages**.
4. Under **Source**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)` folder.
6. Save. The site will be at `https://YOUR_USERNAME.github.io/FCABaking/`.

---

## 4. Quick Checklist

- [ ] Create Google Sheet with column headers
- [ ] Add the Apps Script (full code above, including `doOptions`) and **Deploy → New deployment → Web app**. Set "Anyone" access.
- [ ] If you already had a deployment: **Deploy → Manage deployments → Edit (pencil) → New version → Deploy** — required for redirect/fetch changes
- [ ] Test an order — you should get email, customer gets confirmation, Sheet updates
- [ ] (Optional) Create an expense Sheet and bookmark it
- [ ] Deploy to GitHub Pages

---

## Troubleshooting

**No emails / Sheet not updating**

- The form POSTs directly to your Google Script. Replace the script in Apps Script with the full code from SETUP.md (including `parseFormData`).
- After editing the script: **Deploy → Manage deployments → Edit → New version → Deploy**. The URL stays the same.
- In Apps Script: **Executions** to see if requests are arriving and check for errors.
- Ensure the form `action` in `order.html` matches your deployed Script URL exactly.



