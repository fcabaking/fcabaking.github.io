/**
 * FCA Baking - Order form logic
 * Handles quantity totals, validation, and form submission
 */
(function() {
  const PRICE_PER_CONCHA = 3;
  const vanillaInput = document.getElementById('vanilla-qty');
  const chocolateInput = document.getElementById('chocolate-qty');
  const orderSummary = document.getElementById('order-summary');
  const orderTotal = document.getElementById('order-total');
  const orderTotalHidden = document.getElementById('order-total-hidden');
  const form = document.getElementById('order-form');
  const phoneInput = document.getElementById('phone');
  const emailInput = document.getElementById('email');
  const contactError = document.getElementById('contact-error');
  const primaryContactHidden = document.getElementById('primary-contact-hidden');

  function updateTotal() {
    const vanilla = parseInt(vanillaInput?.value || 0, 10);
    const chocolate = parseInt(chocolateInput?.value || 0, 10);
    const total = (vanilla + chocolate) * PRICE_PER_CONCHA;

    if (orderSummary) {
      orderSummary.textContent = `${vanilla} vanilla + ${chocolate} chocolate = $${total}`;
    }
    if (orderTotal) {
      orderTotal.textContent = `$${total}`;
    }
    if (orderTotalHidden) {
      orderTotalHidden.value = total;
    }

    // Ensure at least one concha is ordered
    const submitBtn = form?.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = total === 0;
    }
  }

  function getPrimaryContact() {
    const selected = document.querySelector('input[name="primary_contact_choice"]:checked');
    return selected?.value || 'email';
  }

  function validateContact(e) {
    const phone = (phoneInput?.value || '').trim();
    const email = (emailInput?.value || '').trim();

    if (!phone || !email) {
      e.preventDefault();
      contactError.classList.add('show');
      contactError.style.display = 'block';
      return false;
    }

    contactError.classList.remove('show');
    contactError.style.display = 'none';
    return true;
  }

  function validateOrder(e) {
    const vanilla = parseInt(vanillaInput?.value || 0, 10);
    const chocolate = parseInt(chocolateInput?.value || 0, 10);

    if (vanilla + chocolate === 0) {
      e.preventDefault();
      alert('Please order at least one concha.');
      return false;
    }

    if (!validateContact(e)) return false;

    const primaryContact = getPrimaryContact();
    if (primaryContactHidden) primaryContactHidden.value = primaryContact;

    // Combine address fields for email/Sheets
    const line1 = document.getElementById('address-line1')?.value?.trim() || '';
    const line2 = document.getElementById('address-line2')?.value?.trim() || '';
    const city = document.getElementById('address-city')?.value?.trim() || '';
    const state = document.getElementById('address-state')?.value?.trim() || '';
    const zip = document.getElementById('address-zip')?.value?.trim() || '';
    const addressParts = [line1, line2, `${city}, ${state} ${zip}`].filter(Boolean);
    const addressCombined = document.getElementById('address-combined');
    if (addressCombined) addressCombined.value = addressParts.join(', ');

    // Generate order ID before submit (sent to email + Sheets + customer confirmation)
    const orderId = generateOrderId();
    const orderIdInput = document.getElementById('order-id');
    if (orderIdInput) orderIdInput.value = orderId;
    return true;
  }

  function generateOrderId() {
    const date = new Date();
    const yymmdd = date.getFullYear().toString().slice(-2) +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `FCA-${yymmdd}-${random}`;
  }

  if (vanillaInput) vanillaInput.addEventListener('input', updateTotal);
  if (chocolateInput) chocolateInput.addEventListener('input', updateTotal);

  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      if (!validateOrder(e)) return;

      const orderId = document.getElementById('order-id')?.value || '';
      const redirectInput = document.getElementById('redirect-base');
      if (redirectInput) {
        let base = window.location.href.replace(/order\.html(\?.*)?$/, '').replace(/\/$/, '');
        if (!base) base = (window.location.origin || '') + (window.location.pathname || '/').replace(/order\.html$/, '').replace(/\/$/, '');
        redirectInput.value = base + (base.endsWith('/') ? '' : '/');
      }
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn?.textContent;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting…';
      }

      const formData = new FormData(form);
      const body = new URLSearchParams(formData).toString();

      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
      })
        .then(function() {
          window.location.href = 'order-thanks.html' + (orderId ? '?order_id=' + encodeURIComponent(orderId) : '');
        })
        .catch(function() {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText || 'Submit Order';
          }
          form.submit();
        });
    });
  }

  // Initial calculation
  updateTotal();
})();
