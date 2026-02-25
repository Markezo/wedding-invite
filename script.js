document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('rsvp-form');
  const attendSelect = form.attend;
  const guestsCountField = document.getElementById('guests-count-field');
  const successMessage = document.getElementById('success');

  const guestsNamesWrapper = document.getElementById('guests-names-wrapper');
  const guestsNamesFields = document.getElementById('guests-names-fields');

  const declineWrapper = document.getElementById('decline-name-wrapper');
  const declineInput = document.getElementById('decline-name');
  const transferField = document.getElementById('transfer-field');

  attendSelect.addEventListener('change', function () {
    if (this.value === 'Так') {
      guestsCountField.style.display = 'block';
      guestsNamesWrapper.style.display = 'none';
      declineWrapper.style.display = 'none';
      transferField.style.display = 'grid'; // display: grid used in CSS for alignment

      form.guests.required = true;
      declineInput.required = false;
      declineInput.value = '';
      guestsNamesFields.innerHTML = '';

    } else if (this.value === 'Ні') {
      guestsCountField.style.display = 'none';
      guestsNamesWrapper.style.display = 'none';
      declineWrapper.style.display = 'block';
      transferField.style.display = 'none';
      form.transfer.checked = false; // reset transfer if not attending

      form.guests.required = false;
      form.guests.value = '';
      guestsNamesFields.innerHTML = '';

      declineInput.required = true;
    } else {
      guestsCountField.style.display = 'none';
      guestsNamesWrapper.style.display = 'none';
      declineWrapper.style.display = 'none';
      transferField.style.display = 'none';

      form.guests.required = false;
      declineInput.required = false;
    }
  });


  form.guests.addEventListener('input', function () {
    const count = parseInt(this.value, 10);
    guestsNamesFields.innerHTML = '';

    if (!count || count < 1) {
      guestsNamesWrapper.style.display = 'none';
      return;
    }

    guestsNamesWrapper.style.display = 'block';

    for (let i = 1; i <= count; i++) {
      const field = document.createElement('div');
      field.className = 'form-field';

      field.innerHTML = `
        <label>
          Гість ${i} *
          <input type="text" required placeholder="Імʼя та прізвище">
        </label>
      `;

      guestsNamesFields.appendChild(field);
    }
  });


  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const data = new FormData();

    // Attend
    data.append('entry.443075754', form.attend.value);

    // Guests count
    data.append('entry.412164390', form.guests.value || '0');

    // Guest names / Decline name
    let guestNames = '';

    if (form.attend.value === 'Так') {
      const guestInputs = guestsNamesFields.querySelectorAll('input');
      guestNames = Array.from(guestInputs)
        .map((input, index) => `Гість ${index + 1}: ${input.value}`)
        .join('\n');
    } else {
      guestNames = `Не зможе бути присутнім: ${declineInput.value}`;
    }

    data.append('entry.1812720247', guestNames);

    // Transfer
    const transferValue = form.transfer.checked ? 'Так' : 'Ні';
    data.append('entry.420213013', transferValue);

    fetch(
      'https://docs.google.com/forms/d/e/1FAIpQLSdZdv8IBM-4k_e3hoIXgJEX8eN89J3a0_pZCrvyv6nviuUIXA/formResponse',
      {
        method: 'POST',
        mode: 'no-cors',
        body: data
      }
    ).then(() => {
      form.style.display = 'none';
      successMessage.style.display = 'block';
      successMessage.scrollIntoView({ behavior: 'smooth' });
    }).catch(err => {
      console.error('Помилка відправки:', err);
    });
  });


  // Анімація появи при скролі
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    let delay = 0;
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.classList.contains('visible')) {
        // Додаємо невелику затримку для послідовної появи, якщо кілька елементів з'являються одночасно
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        delay += 150; // 150ms між кожним елементом
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in, .reveal').forEach(el => {
    observer.observe(el);
  });


  // Dress code gallery toggle
  const toggleBtn = document.querySelector('.dresscode-toggle');
  const gallery = document.querySelector('.dresscode-gallery');

  if (toggleBtn && gallery) {
    toggleBtn.addEventListener('click', () => {
      gallery.classList.toggle('open');

      toggleBtn.textContent = gallery.classList.contains('open')
        ? 'Приховати приклади образів ✨'
        : 'Переглянути приклади образів ✨';
    });
  }

  // Lightbox для dresscode з каруселлю та свайпами
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('img');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  
  const galleryImages = Array.from(document.querySelectorAll('.dresscode-gallery img'));
  let currentIndex = 0;

  function showImage(index) {
    if (index < 0) index = galleryImages.length - 1;
    if (index >= galleryImages.length) index = 0;
    
    currentIndex = index;
    lightboxImg.style.opacity = '0';
    
    // Плавна зміна фото
    setTimeout(() => {
      lightboxImg.src = galleryImages[currentIndex].src;
      lightboxImg.style.opacity = '1';
    }, 150);
  }

  galleryImages.forEach((img, index) => {
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      currentIndex = index;
      lightboxImg.src = img.src;
      lightboxImg.style.opacity = '1';
      lightbox.classList.add('active');
    });
  });

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showImage(currentIndex - 1);
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showImage(currentIndex + 1);
  });

  lightbox.addEventListener('click', () => {
    lightbox.classList.remove('active');
    setTimeout(() => {
      if (!lightbox.classList.contains('active')) {
        lightboxImg.src = '';
      }
    }, 400);
  });

  // Логіка свайпів для мобільних пристроїв
  let touchStartX = 0;
  let touchEndX = 0;

  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      // Свайп вліво -> наступне фото
      showImage(currentIndex + 1);
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      // Свайп вправо -> попереднє фото
      showImage(currentIndex - 1);
    }
  }

  // Підтримка клавіш
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    if (e.key === 'Escape') lightbox.classList.remove('active');
  });



});