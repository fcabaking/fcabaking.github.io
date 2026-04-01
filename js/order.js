/**
 * FCA Baking - Order form (promo bundles + Abuelitas hot chocolate)
 */
(function() {
  const PRICE_COMBO_ABUELITA_CONCHA = 3;
  const PRICE_PACK_2 = 5;
  const PRICE_PACK_4 = 9;
  const PRICE_PACK_8 = 17;
  const PRICE_ABUELITA_CUP = 3.5;

  const form = document.getElementById('order-form');
  const orderSummary = document.getElementById('order-summary');
  const orderTotal = document.getElementById('order-total');
  const orderTotalHidden = document.getElementById('order-total-hidden');
  const orderSummaryHidden = document.getElementById('order-summary-hidden');
  const vanillaHidden = document.getElementById('vanilla-qty-total');
  const chocolateHidden = document.getElementById('chocolate-qty-total');
  const abuelitaTotalCupsHidden = document.getElementById('abuelita-total-cups');
  const phoneInput = document.getElementById('phone');
  const emailInput = document.getElementById('email');
  const contactError = document.getElementById('contact-error');
  const primaryContactHidden = document.getElementById('primary-contact-hidden');

  const inputs = [
    'combo-ac-qty', 'combo-ac-vanilla', 'combo-ac-chocolate',
    'pack2-qty', 'pack2-vanilla', 'pack2-chocolate',
    'pack4-qty', 'pack4-vanilla', 'pack4-chocolate',
    'pack8-qty', 'pack8-vanilla', 'pack8-chocolate',
    'abuelita-only-qty'
  ];

  function intVal(id) {
    return parseInt(document.getElementById(id)?.value || 0, 10) || 0;
  }

  function money(n) {
    return (Math.round(n * 100) / 100).toFixed(2);
  }

  function splitErrors() {
    const errs = [];
    const acQty = intVal('combo-ac-qty');
    const acV = intVal('combo-ac-vanilla');
    const acC = intVal('combo-ac-chocolate');
    if (acV + acC > 0 && acQty === 0) {
      errs.push('Abuelita + concha: set “Number of combos” or clear vanilla/chocolate for that section.');
    }
    if (acQty > 0 && acV + acC !== acQty) {
      errs.push('Abuelita + concha: vanilla + chocolate must equal number of combos.');
    }

    const p2 = intVal('pack2-qty');
    const p2v = intVal('pack2-vanilla');
    const p2c = intVal('pack2-chocolate');
    if (p2v + p2c > 0 && p2 === 0) {
      errs.push('2-concha deal: set “Number of deals” or clear vanilla/chocolate for that section.');
    }
    if (p2 > 0 && p2v + p2c !== p2 * 2) {
      errs.push('2-concha deal: vanilla + chocolate must equal 2 × number of packs.');
    }

    const p4 = intVal('pack4-qty');
    const p4v = intVal('pack4-vanilla');
    const p4c = intVal('pack4-chocolate');
    if (p4v + p4c > 0 && p4 === 0) {
      errs.push('4-concha deal: set “Number of deals” or clear vanilla/chocolate for that section.');
    }
    if (p4 > 0 && p4v + p4c !== p4 * 4) {
      errs.push('4-concha deal: vanilla + chocolate must equal 4 × number of packs.');
    }

    const p8 = intVal('pack8-qty');
    const p8v = intVal('pack8-vanilla');
    const p8c = intVal('pack8-chocolate');
    if (p8v + p8c > 0 && p8 === 0) {
      errs.push('8-concha deal: set “Number of deals” or clear vanilla/chocolate for that section.');
    }
    if (p8 > 0 && p8v + p8c !== p8 * 8) {
      errs.push('8-concha deal: vanilla + chocolate must equal 8 × number of packs.');
    }

    return errs;
  }

  function setBundleOpen(cardId, open) {
    const card = document.getElementById(cardId);
    if (card) card.classList.toggle('bundle-open', open);
  }

  function setSplitNeeded(id, n) {
    const el = document.getElementById(id);
    if (el) el.textContent = String(n);
  }

  function setSplitMeter(meterId, current, needed) {
    const el = document.getElementById(meterId);
    if (!el) return;
    el.classList.remove('match', 'mismatch', 'idle');
    if (needed <= 0) {
      el.classList.add('idle');
      el.textContent = '—';
      return;
    }
    el.textContent = current + ' / ' + needed + ' conchas';
    if (current === needed) el.classList.add('match');
    else el.classList.add('mismatch');
  }

  function updateTotal() {
    const acQty = intVal('combo-ac-qty');
    const acV = intVal('combo-ac-vanilla');
    const acC = intVal('combo-ac-chocolate');
    const p2 = intVal('pack2-qty');
    const p2v = intVal('pack2-vanilla');
    const p2c = intVal('pack2-chocolate');
    const p4 = intVal('pack4-qty');
    const p4v = intVal('pack4-vanilla');
    const p4c = intVal('pack4-chocolate');
    const p8 = intVal('pack8-qty');
    const p8v = intVal('pack8-vanilla');
    const p8c = intVal('pack8-chocolate');
    const abOnly = intVal('abuelita-only-qty');

    const totalVanilla = acV + p2v + p4v + p8v;
    const totalChocolate = acC + p2c + p4c + p8c;
    const totalConchas = totalVanilla + totalChocolate;

    const subtotal =
      acQty * PRICE_COMBO_ABUELITA_CONCHA +
      p2 * PRICE_PACK_2 +
      p4 * PRICE_PACK_4 +
      p8 * PRICE_PACK_8 +
      abOnly * PRICE_ABUELITA_CUP;

    const lines = [];
    if (acQty) lines.push(acQty + '× Abuelita + concha ($3 ea)');
    if (p2) lines.push(p2 + '× 2 conchas ($5 ea)');
    if (p4) lines.push(p4 + '× 4 conchas ($9 ea)');
    if (p8) lines.push(p8 + '× 8 conchas ($17 ea)');
    if (abOnly) lines.push(abOnly + '× Abuelitas hot chocolate cup ($3.50 ea)');
    if (totalConchas) {
      lines.push('Conchas: ' + totalVanilla + ' vanilla, ' + totalChocolate + ' chocolate');
    }

    const summaryText = lines.length ? lines.join(' · ') : 'Nothing selected yet';
    if (orderSummary) orderSummary.textContent = summaryText;
    if (orderTotal) orderTotal.textContent = '$' + money(subtotal);
    if (orderTotalHidden) orderTotalHidden.value = money(subtotal);
    if (vanillaHidden) vanillaHidden.value = String(totalVanilla);
    if (chocolateHidden) chocolateHidden.value = String(totalChocolate);

    const abuelitaCupsTotal = acQty + abOnly;
    if (abuelitaTotalCupsHidden) abuelitaTotalCupsHidden.value = String(abuelitaCupsTotal);

    setBundleOpen('bundle-card-ac', acQty > 0);
    setBundleOpen('bundle-card-p2', p2 > 0);
    setBundleOpen('bundle-card-p4', p4 > 0);
    setBundleOpen('bundle-card-p8', p8 > 0);

    setSplitNeeded('split-needed-ac', acQty);
    setSplitNeeded('split-needed-p2', p2 * 2);
    setSplitNeeded('split-needed-p4', p4 * 4);
    setSplitNeeded('split-needed-p8', p8 * 8);

    setSplitMeter('split-meter-ac', acV + acC, acQty);
    setSplitMeter('split-meter-p2', p2v + p2c, p2 * 2);
    setSplitMeter('split-meter-p4', p4v + p4c, p4 * 4);
    setSplitMeter('split-meter-p8', p8v + p8c, p8 * 8);

    const errs = splitErrors();
    const errEl = document.getElementById('bundle-errors');
    if (errEl) {
      if (errs.length) {
        errEl.textContent = errs.join(' ');
        errEl.classList.add('show');
      } else {
        errEl.textContent = '';
        errEl.classList.remove('show');
      }
    }

    const hasItems = subtotal > 0;
    const splitsOk = errs.length === 0;
    const submitBtn = form?.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = !hasItems || !splitsOk;
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
    const acQty = intVal('combo-ac-qty');
    const acV = intVal('combo-ac-vanilla');
    const acC = intVal('combo-ac-chocolate');
    const p2 = intVal('pack2-qty');
    const p2v = intVal('pack2-vanilla');
    const p2c = intVal('pack2-chocolate');
    const p4 = intVal('pack4-qty');
    const p4v = intVal('pack4-vanilla');
    const p4c = intVal('pack4-chocolate');
    const p8 = intVal('pack8-qty');
    const p8v = intVal('pack8-vanilla');
    const p8c = intVal('pack8-chocolate');
    const abOnly = intVal('abuelita-only-qty');
    const abCupsTotal = acQty + abOnly;

    const totalVanilla = acV + p2v + p4v + p8v;
    const totalChocolate = acC + p2c + p4c + p8c;
    const totalConchas = totalVanilla + totalChocolate;

    const subtotal =
      acQty * PRICE_COMBO_ABUELITA_CONCHA +
      p2 * PRICE_PACK_2 +
      p4 * PRICE_PACK_4 +
      p8 * PRICE_PACK_8 +
      abOnly * PRICE_ABUELITA_CUP;

    if (subtotal <= 0) {
      e.preventDefault();
      alert('Please add at least one item to your order.');
      return false;
    }

    const errs = splitErrors();
    if (errs.length) {
      e.preventDefault();
      alert(errs.join('\n'));
      return false;
    }

    if (!validateContact(e)) return false;

    const primaryContact = getPrimaryContact();
    if (primaryContactHidden) primaryContactHidden.value = primaryContact;

    const line1 = document.getElementById('address-line1')?.value?.trim() || '';
    const line2 = document.getElementById('address-line2')?.value?.trim() || '';
    const city = document.getElementById('address-city')?.value?.trim() || '';
    const state = document.getElementById('address-state')?.value?.trim() || '';
    const zip = document.getElementById('address-zip')?.value?.trim() || '';
    const addressParts = [line1, line2, `${city}, ${state} ${zip}`].filter(Boolean);
    const addressCombined = document.getElementById('address-combined');
    if (addressCombined) addressCombined.value = addressParts.join(', ');

    const orderId = generateOrderId();
    const orderIdInput = document.getElementById('order-id');
    if (orderIdInput) orderIdInput.value = orderId;

    if (orderSummaryHidden) {
      const parts = [
        'Order ' + orderId,
        'Total $' + money(subtotal),
        totalConchas ? 'Conchas: ' + totalVanilla + ' vanilla, ' + totalChocolate + ' chocolate' : '',
        acQty ? 'Abuelita+concha combos: ' + acQty : '',
        p2 ? '2-packs: ' + p2 : '',
        p4 ? '4-packs: ' + p4 : '',
        p8 ? '8-packs: ' + p8 : '',
        abOnly ? 'Hot chocolate cups (only): ' + abOnly : '',
        abCupsTotal ? 'Abuelita cups (all): ' + abCupsTotal : ''
      ].filter(Boolean);
      orderSummaryHidden.value = parts.join(' | ');
    }

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

  inputs.forEach(function(id) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateTotal);
  });

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

  updateTotal();
})();
