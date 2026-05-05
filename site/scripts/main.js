'use strict';

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initHeaderScroll();
    initSmoothScroll();
    initCoachSlider();
    initCoachModal();
    initBranchesTabs();
    initReviewsTabs();
    initReviewsSliders();
    initSignupForm();
});

/* =========================
   Mobile menu
========================= */

function initMobileMenu() {
    const burger = document.querySelector('.header__burger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-menu a');

    if (!burger || !mobileMenu || !overlay) return;

    const closeMenu = () => {
        burger.classList.remove('active');
        mobileMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('menu-open');
        burger.setAttribute('aria-expanded', 'false');
    };

    const openMenu = () => {
        burger.classList.add('active');
        mobileMenu.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('menu-open');
        burger.setAttribute('aria-expanded', 'true');
    };

    burger.setAttribute('aria-expanded', 'false');

    burger.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.contains('active');

        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    overlay.addEventListener('click', closeMenu);

    mobileLinks.forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMenu();
        }
    });
}

/* =========================
   Header scroll behavior
========================= */

function initHeaderScroll() {
    const header = document.querySelector('.header');

    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateHeader = () => {
        const currentScrollY = window.scrollY;

        header.classList.toggle('scrolled', currentScrollY > 30);

        if (document.body.classList.contains('menu-open')) {
            header.classList.remove('header--hidden');
            lastScrollY = currentScrollY;
            ticking = false;
            return;
        }

        if (currentScrollY <= 10) {
            header.classList.remove('header--hidden');
        } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
            header.classList.add('header--hidden');
        } else if (currentScrollY < lastScrollY) {
            header.classList.remove('header--hidden');
        }

        lastScrollY = currentScrollY;
        ticking = false;
    };

    updateHeader();

    window.addEventListener(
        'scroll',
        () => {
            if (!ticking) {
                window.requestAnimationFrame(updateHeader);
                ticking = true;
            }
        },
        { passive: true }
    );
}

/* =========================
   Smooth scroll
========================= */

function initSmoothScroll() {
    const header = document.querySelector('.header');
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach((link) => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');

            if (!href || href === '#') return;

            const target = document.querySelector(href);

            if (!target) return;

            event.preventDefault();

            const headerHeight = header ? header.offsetHeight : 0;
            const topOffset = headerHeight + 20;
            const topPosition =
                target.getBoundingClientRect().top + window.pageYOffset - topOffset;

            window.scrollTo({
                top: topPosition,
                behavior: 'smooth'
            });
        });
    });
}

/* =========================
   Coach slider
========================= */

function initCoachSlider() {
    if (typeof Swiper === 'undefined') return;

    const slider = document.querySelector('.coach-slider');

    if (!slider) return;

    new Swiper('.coach-slider', {
        loop: true,
        speed: 800,
        slidesPerGroup: 1,
        centeredSlides: false,
        watchOverflow: true,
        observer: true,
        observeParents: true,
        slidesPerView: 1.1,
        spaceBetween: 16,

        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
            waitForTransition: false
        },

        navigation: {
            nextEl: '.coach-slider__btn--next',
            prevEl: '.coach-slider__btn--prev'
        },

        breakpoints: {
            640: {
                slidesPerView: 2,
                spaceBetween: 18
            },
            1024: {
                slidesPerView: 2.8,
                spaceBetween: 24
            }
        }
    });
}

/* =========================
   Coach modal
========================= */

function initCoachModal() {
    const coachModal = document.getElementById('coachModal');
    const coachCards = document.querySelectorAll('.coach-card');

    if (!coachModal || !coachCards.length) return;

    const closeButton = coachModal.querySelector('.coach-modal__close');
    const overlay = coachModal.querySelector('.coach-modal__overlay');

    const photoEl = document.getElementById('coachModalPhoto');
    const nameEl = document.getElementById('coachModalName');
    const roleEl = document.getElementById('coachModalRole');
    const achievementsEl = document.getElementById('coachModalAchievements');
    const vkEl = document.getElementById('coachModalVk');
    const instEl = document.getElementById('coachModalInst');
    const tgEl = document.getElementById('coachModalTg');
    const signupLink = coachModal.querySelector('.coach-modal__btn');

    const openModal = (card) => {
        const name = card.dataset.name || '';
        const photo = card.dataset.photo || '';
        const role = card.dataset.role || '';
        const achievements = card.dataset.achievements || '';
        const vk = card.dataset.vk || '#';
        const inst = card.dataset.inst || '#';
        const tg = card.dataset.tg || '#';

        if (photoEl) {
            photoEl.src = photo;
            photoEl.alt = name;
        }

        if (nameEl) nameEl.textContent = name;
        if (roleEl) roleEl.textContent = role;

        if (achievementsEl) {
            achievementsEl.innerHTML = '';

            achievements
                .split('|')
                .map((item) => item.trim())
                .filter(Boolean)
                .forEach((item) => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    achievementsEl.appendChild(li);
                });
        }

        setSafeLink(vkEl, vk);
        setSafeLink(instEl, inst);
        setSafeLink(tgEl, tg);

        coachModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        coachModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    coachCards.forEach((card) => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');

        card.addEventListener('click', () => openModal(card));

        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openModal(card);
            }
        });
    });

    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }

    if (signupLink) {
        signupLink.addEventListener('click', closeModal);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && coachModal.classList.contains('active')) {
            closeModal();
        }
    });
}

function setSafeLink(element, url) {
    if (!element) return;

    const safeUrl = String(url || '').trim();

    if (!safeUrl || safeUrl === '#') {
        element.href = '#';
        element.style.display = 'none';
        return;
    }

    element.href = safeUrl;
    element.style.display = '';
}

/* =========================
   Branch tabs
========================= */

function initBranchesTabs() {
    const buttons = document.querySelectorAll('.branches-tabs__btn');
    const panes = document.querySelectorAll('.branches-pane');

    if (!buttons.length || !panes.length) return;

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const branch = button.dataset.branch;

            if (!branch) return;

            buttons.forEach((btn) => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });

            panes.forEach((pane) => {
                pane.classList.remove('active');
            });

            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');

            const activePane = document.getElementById(`branch-${branch}`);

            if (activePane) {
                activePane.classList.add('active');
            }
        });
    });
}

/* =========================
   Reviews tabs
========================= */

function initReviewsTabs() {
    const tabs = document.querySelectorAll('.reviews-tabs__btn');
    const panes = document.querySelectorAll('.reviews-pane');

    if (!tabs.length || !panes.length) return;

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.reviewTab;

            if (!tabName) return;

            tabs.forEach((btn) => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });

            panes.forEach((pane) => {
                pane.classList.remove('active');
            });

            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            const activePane = document.getElementById(`reviews-${tabName}`);

            if (activePane) {
                activePane.classList.add('active');
            }
        });
    });
}

/* =========================
   Reviews sliders
========================= */

function initReviewsSliders() {
    if (typeof Swiper === 'undefined') return;

    if (document.querySelector('.reviews-swiper-yandex')) {
        new Swiper('.reviews-swiper-yandex', {
            slidesPerView: 1,
            loop: true,
            spaceBetween: 12,
            speed: 700,

            navigation: {
                nextEl: '.reviews-slider__btn--next-yandex',
                prevEl: '.reviews-slider__btn--prev-yandex'
            },

            breakpoints: {
                640: {
                    slidesPerView: 1.2,
                    spaceBetween: 14
                },
                768: {
                    slidesPerView: 2,
                    spaceBetween: 18
                },
                1200: {
                    slidesPerView: 3,
                    spaceBetween: 20
                }
            }
        });
    }

    if (document.querySelector('.reviews-swiper-gis')) {
        new Swiper('.reviews-swiper-gis', {
            slidesPerView: 1,
            loop: true,
            spaceBetween: 12,
            speed: 700,

            navigation: {
                nextEl: '.reviews-slider__btn--next-gis',
                prevEl: '.reviews-slider__btn--prev-gis'
            },

            breakpoints: {
                640: {
                    slidesPerView: 1.2,
                    spaceBetween: 14
                },
                768: {
                    slidesPerView: 2,
                    spaceBetween: 18
                },
                1200: {
                    slidesPerView: 3,
                    spaceBetween: 20
                }
            }
        });
    }
}

/* =========================
   Signup form
========================= */

function initSignupForm() {
    const form = document.getElementById('signupForm');
    const trainingType = document.getElementById('trainingType');
    const trainerGroup = document.getElementById('trainerGroup');
    const trainerSelect = document.getElementById('trainerSelect');
    const phoneInput = document.getElementById('signupPhone');
    const submitButton = document.getElementById('signupSubmitBtn');
    const buttonText = submitButton ? submitButton.querySelector('.btn-text') : null;
    const successMessage = document.getElementById('signupSuccessMessage');
    const errorMessage = document.getElementById('signupErrorMessage');

    if (
        !form ||
        !trainingType ||
        !trainerGroup ||
        !trainerSelect ||
        !phoneInput ||
        !submitButton ||
        !buttonText ||
        !successMessage ||
        !errorMessage
    ) {
        return;
    }

    const formStartTime = Date.now();
    let isSending = false;

    const toggleTrainerField = () => {
        const isIndividual = trainingType.value === 'Индивидуальная';

        trainerGroup.classList.toggle('active', isIndividual);
        trainerSelect.disabled = !isIndividual;
        trainerSelect.required = isIndividual;

        if (!isIndividual) {
            trainerSelect.selectedIndex = 0;
        }
    };

    const setStatus = (type, message = '') => {
        successMessage.classList.remove('active');
        errorMessage.classList.remove('active');

        successMessage.textContent = '';
        errorMessage.textContent = '';

        if (type === 'success') {
            successMessage.textContent = message;
            successMessage.classList.add('active');
        }

        if (type === 'error') {
            errorMessage.textContent = message;
            errorMessage.classList.add('active');
        }
    };

    const setLoading = (state) => {
        isSending = state;
        submitButton.disabled = state;
        buttonText.textContent = state ? 'ОТПРАВЛЯЕМ...' : 'ОТПРАВИТЬ ЗАЯВКУ';
    };

    trainingType.addEventListener('change', toggleTrainerField);

    phoneInput.addEventListener('input', (event) => {
        event.target.value = formatPhone(event.target.value);
    });

    phoneInput.addEventListener('focus', () => {
        if (!phoneInput.value.trim()) {
            phoneInput.value = '+7';
        }
    });

    toggleTrainerField();

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (isSending) return;

        setStatus();

        const formData = new FormData(form);

        const name = String(formData.get('name') || '').trim();
        const phone = String(formData.get('phone') || '').trim();
        const phoneDigits = getPhoneDigits(phone);
        const trainingTypeValue = String(formData.get('training_type') || '').trim();
        const trainerValue = trainerSelect.disabled
            ? ''
            : String(formData.get('trainer') || '').trim();
        const message = String(formData.get('message') || '').trim();

        if (!name || name.length < 2 || name.length > 80) {
            setStatus('error', 'Введите корректное имя.');
            form.elements.name?.focus();
            return;
        }

        if (phoneDigits.length !== 11 || !/^7\d{10}$/.test(phoneDigits)) {
            setStatus('error', 'Введите корректный номер телефона в формате +7.');
            phoneInput.focus();
            return;
        }

        if (!trainingTypeValue) {
            setStatus('error', 'Выберите тип тренировки.');
            trainingType.focus();
            return;
        }

        if (!['Групповая', 'Индивидуальная'].includes(trainingTypeValue)) {
            setStatus('error', 'Некорректный тип тренировки.');
            return;
        }

        if (trainingTypeValue === 'Индивидуальная' && !trainerValue) {
            setStatus('error', 'Выберите тренера для индивидуальной тренировки.');
            trainerSelect.focus();
            return;
        }

        if (message.length > 900) {
            setStatus('error', 'Комментарий слишком длинный. Максимум 900 символов.');
            return;
        }

        const payload = {
            name,
            phone,
            training_type: trainingTypeValue,
            trainer: trainerValue,
            message,
            page: window.location.href,
            form_time: formStartTime
        };

        try {
            setLoading(true);

            const response = await fetch('/api/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            let result = null;

            try {
                result = await response.json();
            } catch {
                result = null;
            }

            if (!response.ok || !result?.success) {
                throw new Error(result?.message || 'Не удалось отправить заявку.');
            }

            setStatus(
                'success',
                result.message || 'Спасибо! Заявка отправлена, мы скоро свяжемся с вами.'
            );

            form.reset();
            toggleTrainerField();
            phoneInput.value = '';
        } catch (error) {
            setStatus(
                'error',
                error.message || 'Ошибка отправки. Попробуйте ещё раз чуть позже.'
            );
        } finally {
            setLoading(false);
        }
    });
}

function formatPhone(value) {
    const rawDigits = String(value || '').replace(/\D/g, '').slice(0, 11);

    let normalized = rawDigits;

    if (normalized.startsWith('8')) {
        normalized = '7' + normalized.slice(1);
    }

    if (!normalized.startsWith('7') && normalized.length > 0) {
        normalized = '7' + normalized.slice(0, 10);
    }

    let result = '+7';

    if (normalized.length > 1) {
        result += ` (${normalized.slice(1, 4)}`;
    }

    if (normalized.length >= 5) {
        result += `) ${normalized.slice(4, 7)}`;
    }

    if (normalized.length >= 8) {
        result += `-${normalized.slice(7, 9)}`;
    }

    if (normalized.length >= 10) {
        result += `-${normalized.slice(9, 11)}`;
    }

    return result;
}

function getPhoneDigits(value) {
    return String(value || '').replace(/\D/g, '');
}
