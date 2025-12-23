// js/main.js
// BIT703 Assessment 2 – site interactions
// - Footer year
// - Back-to-top button
// - Demo cart count
// - Free shipping rule
// - Newsletter email validation
// - Shipping form validation
// - Payment form validation + live digit filtering

document.addEventListener('DOMContentLoaded', function () {
  // ===============================
  // 1. Footer year
  // ===============================
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // ===============================
  // 2. Back-to-top button
  // ===============================
  const backToTopBtn = document.querySelector('.back-to-top');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.remove('d-none');
      } else {
        backToTopBtn.classList.add('d-none');
      }
    });

    backToTopBtn.addEventListener('click', (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===============================
  // 3. Simple cart count (demo)
  // ===============================
  const cartCountElements = document.querySelectorAll('.cart-count');
  const CART_KEY = 'aagCartCount';

  function updateCartCountDisplay(count) {
    cartCountElements.forEach((el) => {
      el.textContent = count;
    });
  }

  function getCartCount() {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? parseInt(stored, 10) || 0 : 0;
  }

  function setCartCount(count) {
    localStorage.setItem(CART_KEY, String(count));
    updateCartCountDisplay(count);
  }

  const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
  addToCartButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const current = getCartCount();
      const next = current + 1;
      setCartCount(next);
      alert(
        `This item has been added to your cart (demo only). Items in cart: ${next}`
      );
    });
  });

  // Initialise cart count on load
  setCartCount(getCartCount());

  // ===============================
  // 4. Free shipping rule (shipping page)
  // ===============================
  const subtotalEl = document.getElementById('summarySubtotal');
  const shippingEl = document.getElementById('summaryShipping');
  const taxEl = document.getElementById('summaryTax');
  const totalEl = document.getElementById('summaryTotal');
  const freeNote = document.getElementById('freeShippingNote');

  if (subtotalEl && shippingEl && taxEl && totalEl) {
    const parseAmount = (text) =>
      parseFloat(String(text).replace(/[^0-9.]/g, '')) || 0;
    const formatAmount = (value) => `$${value.toFixed(2)}`;

    const subtotal = parseAmount(subtotalEl.textContent);
    const tax = parseAmount(taxEl.textContent);
    const originalShipping =
      parseFloat(shippingEl.dataset.originalShipping) ||
      parseAmount(shippingEl.textContent);

    let shipping = originalShipping;

    if (subtotal >= 600) {
      shipping = 0;
      shippingEl.textContent = formatAmount(0);
      if (freeNote) freeNote.classList.remove('d-none');
    } else {
      shippingEl.textContent = formatAmount(originalShipping);
      if (freeNote) freeNote.classList.add('d-none');
    }

    const total = subtotal + shipping + tax;
    totalEl.textContent = formatAmount(total);
  }

  // ===============================
  // 5. Newsletter email validation
  // ===============================
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterEmail = document.getElementById('newsletterEmail');

  if (newsletterForm && newsletterEmail) {
    newsletterForm.addEventListener('submit', (event) => {
      const value = newsletterEmail.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(value)) {
        event.preventDefault();
        newsletterEmail.classList.add('is-invalid');
        newsletterEmail.classList.remove('is-valid');
      } else {
        event.preventDefault(); // demo only
        newsletterEmail.classList.remove('is-invalid');
        newsletterEmail.classList.add('is-valid');
        alert('Thanks for subscribing to our trail updates!');
        newsletterForm.reset();
        newsletterEmail.classList.remove('is-valid');
      }
    });
  }

  // ===============================
  // 6. Shipping form validation
  // ===============================
  const shippingForm = document.getElementById('shippingForm');

  if (shippingForm) {
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const address1 = document.getElementById('address1');
    const city = document.getElementById('city');
    const postcode = document.getElementById('postcode');
    const phone = document.getElementById('phone');
    const shippingNext = document.querySelector('a[href="payment.html"]');

    const setShippingError = (field, message) => {
      if (!field) return;
      field.setCustomValidity(message);
      field.classList.add('is-invalid');
      field.classList.remove('is-valid');
    };

    const clearShippingError = (field) => {
      if (!field) return;
      field.setCustomValidity('');
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
    };

    shippingForm.addEventListener('submit', (event) => {
      event.preventDefault();
      let hasError = false;

      // Clear existing flags
      [firstName, lastName, address1, city, postcode, phone].forEach(
        (field) => field && clearShippingError(field)
      );

      // Simple required-text check
      const requiredTextFields = [
        { field: firstName, label: 'First name' },
        { field: lastName, label: 'Last name' },
        { field: address1, label: 'Address' },
        { field: city, label: 'City' }
      ];

      requiredTextFields.forEach(({ field, label }) => {
        if (field && !field.value.trim()) {
          setShippingError(field, `${label} is required.`);
          hasError = true;
        }
      });

      // Postcode: 4 digits
      if (postcode) {
        const value = postcode.value.trim();
        const nzPostcodePattern = /^\d{4}$/;
        if (!value) {
          setShippingError(postcode, 'Postcode is required.');
          hasError = true;
        } else if (!nzPostcodePattern.test(value)) {
          setShippingError(
            postcode,
            'Please enter a 4-digit New Zealand postcode.'
          );
          hasError = true;
        }
      }

      // Phone: 7–15 digits/spaces/+-
      if (phone) {
        const phoneValue = phone.value.trim();
        const phonePattern = /^[0-9\s()+-]{7,15}$/;

        if (!phoneValue) {
          setShippingError(phone, 'Please enter your phone number.');
          hasError = true;
        } else if (!phonePattern.test(phoneValue)) {
          setShippingError(
            phone,
            'Please enter a valid phone number (7–15 digits).'
          );
          hasError = true;
        }
      }

      if (hasError) {
        shippingForm.reportValidity();
        return;
      }

      
      // All good – go to payment page (demo)
      window.location.href = 'payment.html';
    });
  }

  // ===============================
  // 7. Payment form validation
  // ===============================
  const paymentForm = document.getElementById('paymentForm');

  if (paymentForm) {
    const payCard = document.getElementById('payCard');
    const payPaypal = document.getElementById('payPaypal');
    const cardNumber = document.getElementById('cardNumber');
    const cardExpiry = document.getElementById('expiry');
    const cardCvv = document.getElementById('cvv');
    const cardName = document.getElementById('cardName');

    // --- Live input cleaning: numbers only for card + CVV ---
    const forceDigitsOnly = (field, maxLength) => {
      if (!field) return;
      field.addEventListener('input', () => {
        let v = field.value.replace(/\D/g, ''); // strip non-digits
        if (maxLength) v = v.slice(0, maxLength);
        field.value = v;
      });
    };

    forceDigitsOnly(cardNumber, 16); // card number up to 16 digits
    forceDigitsOnly(cardCvv, 4);     // CVV up to 4 digits

    // Auto-format expiry as MM/YY
    if (cardExpiry) {
      cardExpiry.addEventListener('input', () => {
        let v = cardExpiry.value.replace(/\D/g, '').slice(0, 4); // MMYY
        if (v.length >= 3) {
          v = v.slice(0, 2) + '/' + v.slice(2);
        }
        cardExpiry.value = v;
      });
    }

    const setPaymentError = (field, message) => {
      if (!field) return;
      field.setCustomValidity(message);
      field.classList.add('is-invalid');
      field.classList.remove('is-valid');
    };

    const clearPaymentError = (field) => {
      if (!field) return;
      field.setCustomValidity('');
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
    };

    paymentForm.addEventListener('submit', (event) => {
      event.preventDefault();
      let hasError = false;

      // Clear previous flags
      [cardNumber, cardExpiry, cardCvv, cardName].forEach((field) =>
        field && clearPaymentError(field)
      );

      // If PayPal is selected, just show a demo message
      if (payPaypal && payPaypal.checked) {
        alert('Redirecting to PayPal (demo only).');
        return;
      }

      // From here, assume credit card is selected
      // Card number: 13–16 digits
      if (cardNumber) {
        const digits = cardNumber.value.replace(/\D/g, '');
        if (!digits) {
          setPaymentError(cardNumber, 'Card number is required.');
          hasError = true;
        } else if (digits.length < 13 || digits.length > 16) {
          setPaymentError(
            cardNumber,
            'Card number should be 13–16 digits long.'
          );
          hasError = true;
        }
      }

      // Expiry: MM/YY and a reasonable range (01–12 for month)
      if (cardExpiry) {
        const value = cardExpiry.value.trim();
        const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;

        if (!value) {
          setPaymentError(cardExpiry, 'Expiry date is required.');
          hasError = true;
        } else if (!expiryPattern.test(value)) {
          setPaymentError(cardExpiry, 'Use MM/YY format, e.g. 04/27.');
          hasError = true;
        }
      }

      // CVV: 3–4 digits
      if (cardCvv) {
        const digits = cardCvv.value.replace(/\D/g, '');
        if (!digits) {
          setPaymentError(cardCvv, 'CVV is required.');
          hasError = true;
        } else if (digits.length < 3 || digits.length > 4) {
          setPaymentError(cardCvv, 'CVV should be 3 or 4 digits.');
          hasError = true;
        }
      }

      // Card holder name: at least 2 characters
      if (cardName) {
        const nameValue = cardName.value.trim();
        if (!nameValue) {
          setPaymentError(cardName, 'Card holder name is required.');
          hasError = true;
        } else if (nameValue.length < 2) {
          setPaymentError(
            cardName,
            'Please enter the full card holder name.'
          );
          hasError = true;
        }
      }

      if (hasError) {
        paymentForm.reportValidity();
        return;
      }

      // All good – demo success
      alert('Payment details accepted (demo only). No real charge made.');
    });

     // ===============================
  // 8. Cart quantity + coupon validation
  // ===============================
  const cartQtyInputs = document.querySelectorAll('.cart-qty');
  cartQtyInputs.forEach((input) => {
    input.addEventListener('change', () => {
      let value = parseInt(input.value, 10);

      if (isNaN(value) || value < 1) {
        value = 1;
      }
      input.value = value;
    });
  });

  const couponInput = document.getElementById('coupon');
  if (couponInput) {
    couponInput.addEventListener('input', () => {
      // allow only letters, numbers and dashes
      couponInput.value = couponInput.value.replace(/[^A-Za-z0-9-]/g, '');
    });
  }
}
});
