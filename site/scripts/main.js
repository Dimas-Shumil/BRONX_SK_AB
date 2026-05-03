const burger = document.querySelector('.header__burger');
const mobileMenu = document.querySelector('.mobile-menu');
const overlay = document.querySelector('.mobile-menu-overlay');
const mobileLinks = document.querySelectorAll('.mobile-menu a');
const header = document.querySelector('.header');

if (burger && mobileMenu && overlay) {
    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    overlay.addEventListener('click', closeMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
}

function closeMenu() {
    burger.classList.remove('active');
    mobileMenu.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('menu-open');
}

if (header) {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateHeader = () => {
        const currentScrollY = window.scrollY;

        // сжатие хедера после прокрутки
        if (currentScrollY > 30) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // если мобильное меню открыто — не скрываем хедер
        if (document.body.classList.contains('menu-open')) {
            header.classList.remove('header--hidden');
            lastScrollY = currentScrollY;
            ticking = false;
            return;
        }

        // в самом верху страницы хедер всегда виден
        if (currentScrollY <= 10) {
            header.classList.remove('header--hidden');
        }
        // скроллим вниз — прячем
        else if (currentScrollY > lastScrollY && currentScrollY > 100) {
            header.classList.add('header--hidden');
        }
        // скроллим вверх — показываем
        else if (currentScrollY < lastScrollY) {
            header.classList.remove('header--hidden');
        }

        lastScrollY = currentScrollY;
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    });
}

// 3. Плавный скролл к секциям

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const href = this.getAttribute('href');
            if (!href || href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            const headerHeight = header?.offsetHeight || 0;
            const topOffset = headerHeight + 20;

            const topPos = target.getBoundingClientRect().top + window.pageYOffset - topOffset;

            window.scrollTo({
                top: topPos,
                behavior: 'smooth'
            });

            if (burger && nav && nav.classList.contains('active')) {
                burger.classList.remove('active');
                nav.classList.remove('active');
            }
        });
    });
});


// swiper + popupd
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.coach-slider') && typeof Swiper !== 'undefined') {
        new Swiper('.coach-slider', {
            loop: true,
            loopedSlides: 4,
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
                prevEl: '.coach-slider__btn--prev',
            },

            breakpoints: {
                640: {
                    slidesPerView: 2,
                    spaceBetween: 18,
                },
                1024: {
                    slidesPerView: 2.8,
                    spaceBetween: 24,
                }
            }
        });
    }

    const coachModal = document.getElementById('coachModal');
    const coachCards = document.querySelectorAll('.coach-card');

    if (!coachModal) return;

    const coachModalClose = coachModal.querySelector('.coach-modal__close');
    const coachModalOverlay = coachModal.querySelector('.coach-modal__overlay');

    const coachModalPhoto = document.getElementById('coachModalPhoto');
    const coachModalName = document.getElementById('coachModalName');
    const coachModalRole = document.getElementById('coachModalRole');
    const coachModalAchievements = document.getElementById('coachModalAchievements');
    const coachModalVk = document.getElementById('coachModalVk');
    const coachModalInst = document.getElementById('coachModalInst');
    const coachModalTg = document.getElementById('coachModalTg');

    function openCoachModal(card) {
        const name = card.dataset.name || '';
        const photo = card.dataset.photo || '';
        const role = card.dataset.role || '';
        const achievements = card.dataset.achievements || '';
        const vk = card.dataset.vk || '#';
        const inst = card.dataset.inst || '#';
        const tg = card.dataset.tg || '#';

        coachModalPhoto.src = photo;
        coachModalPhoto.alt = name;
        coachModalName.textContent = name;
        coachModalRole.textContent = role;

        coachModalAchievements.innerHTML = '';

        achievements
            .split('|')
            .map(item => item.trim())
            .filter(Boolean)
            .forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                coachModalAchievements.appendChild(li);
            });

        coachModalVk.href = vk;
        coachModalInst.href = inst;
        coachModalTg.href = tg;

        coachModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCoachModal() {
        coachModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    coachCards.forEach(card => {
        card.addEventListener('click', () => openCoachModal(card));
    });

    if (coachModalClose) {
        coachModalClose.addEventListener('click', closeCoachModal);
    }

    if (coachModalOverlay) {
        coachModalOverlay.addEventListener('click', closeCoachModal);
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && coachModal.classList.contains('active')) {
            closeCoachModal();
        }
    });
});


//  переключение окон филиалы


const branchButtons = document.querySelectorAll('.branches-tabs__btn');
const branchPanes = document.querySelectorAll('.branches-pane');

branchButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const branch = button.dataset.branch;

        branchButtons.forEach((btn) => btn.classList.remove('active'));
        branchPanes.forEach((pane) => pane.classList.remove('active'));

        button.classList.add('active');

        const activePane = document.getElementById(`branch-${branch}`);
        if (activePane) {
            activePane.classList.add('active');
        }
    });
});

// seiper reviews

const reviewTabs = document.querySelectorAll('.reviews-tabs__btn');
const reviewPanes = document.querySelectorAll('.reviews-pane');

reviewTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.reviewTab;

        reviewTabs.forEach((btn) => btn.classList.remove('active'));
        reviewPanes.forEach((pane) => pane.classList.remove('active'));

        tab.classList.add('active');

        const activePane = document.getElementById(`reviews-${tabName}`);
        if (activePane) {
            activePane.classList.add('active');
        }
    });
});

const reviewsSwiperYandex = new Swiper('.reviews-swiper-yandex', {
    slidesPerView: 1,
    loop: true,
    spaceBetween: 12,
    speed: 700,
    navigation: {
        nextEl: '.reviews-slider__btn--next-yandex',
        prevEl: '.reviews-slider__btn--prev-yandex',
    },
    breakpoints: {
        640: {
            slidesPerView: 1.2,
            spaceBetween: 14,
        },
        768: {
            slidesPerView: 2,
            spaceBetween: 18,
        },
        1200: {
            slidesPerView: 3,
            spaceBetween: 20,
        }
    }
});

const reviewsSwiperGis = new Swiper('.reviews-swiper-gis', {
    slidesPerView: 1,
    loop: true,
    spaceBetween: 12,
    speed: 700,
    navigation: {
        nextEl: '.reviews-slider__btn--next-gis',
        prevEl: '.reviews-slider__btn--prev-gis',
    },
    breakpoints: {
        640: {
            slidesPerView: 1.2,
            spaceBetween: 14,
        },
        768: {
            slidesPerView: 2,
            spaceBetween: 18,
        },
        1200: {
            slidesPerView: 3,
            spaceBetween: 20,
        }
    }
});



//  form
// form

const signupForm = document.getElementById('signupForm');
const trainingType = document.getElementById('trainingType');
const trainerGroup = document.getElementById('trainerGroup');
const trainerSelect = document.getElementById('trainerSelect');
const signupPhone = document.getElementById('signupPhone');
const signupSubmitBtn = document.getElementById('signupSubmitBtn');
const signupBtnText = signupSubmitBtn ? signupSubmitBtn.querySelector('.btn-text') : null;
const signupSuccessMessage = document.getElementById('signupSuccessMessage');
const signupErrorMessage = document.getElementById('signupErrorMessage');

if (
    signupForm &&
    trainingType &&
    trainerGroup &&
    trainerSelect &&
    signupPhone &&
    signupSubmitBtn &&
    signupBtnText &&
    signupSuccessMessage &&
    signupErrorMessage
) {
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

    const setStatus = (type, message) => {
        signupSuccessMessage.classList.remove('active');
        signupErrorMessage.classList.remove('active');

        if (type === 'success') {
            signupSuccessMessage.textContent = message;
            signupSuccessMessage.classList.add('active');
        }

        if (type === 'error') {
            signupErrorMessage.textContent = message;
            signupErrorMessage.classList.add('active');
        }
    };

    const formatPhone = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 11);

        let normalized = digits;

        if (normalized.startsWith('8')) {
            normalized = '7' + normalized.slice(1);
        }

        if (!normalized.startsWith('7') && normalized.length > 0) {
            normalized = '7' + normalized.slice(0, 10);
        }

        let result = '+7';

        if (normalized.length > 1) {
            result += ' (' + normalized.slice(1, 4);
        }

        if (normalized.length >= 5) {
            result += ') ' + normalized.slice(4, 7);
        }

        if (normalized.length >= 8) {
            result += '-' + normalized.slice(7, 9);
        }

        if (normalized.length >= 10) {
            result += '-' + normalized.slice(9, 11);
        }

        return result;
    };

    const getPhoneDigits = (value) => value.replace(/\D/g, '');

    trainingType.addEventListener('change', toggleTrainerField);

    signupPhone.addEventListener('input', (event) => {
        event.target.value = formatPhone(event.target.value);
    });

    toggleTrainerField();

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (isSending) return;

        setStatus('', '');

        const formData = new FormData(signupForm);

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
            signupForm.name?.focus();
            return;
        }

        if (phoneDigits.length !== 11 || !/^7\d{10}$/.test(phoneDigits)) {
            setStatus('error', 'Введите корректный номер телефона в формате +7.');
            signupPhone.focus();
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
            page: window.location.pathname,
            form_time: formStartTime
        };

        isSending = true;
        signupSubmitBtn.disabled = true;
        signupBtnText.textContent = 'Отправка...';

        try {
            const response = await fetch('/api/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json().catch(() => null);

            if (!response.ok || !result?.success) {
                throw new Error(result?.message || 'Не удалось отправить заявку.');
            }

            setStatus(
                'success',
                result.message || 'Спасибо! Заявка отправлена, мы скоро свяжемся с вами.'
            );

            signupForm.reset();
            toggleTrainerField();
        } catch (error) {
            console.error('Ошибка отправки формы:', error);

            setStatus(
                'error',
                error.message || 'Ошибка соединения. Попробуйте ещё раз чуть позже.'
            );
        } finally {
            isSending = false;
            signupSubmitBtn.disabled = false;
            signupBtnText.textContent = 'Записаться на тренировку';
        }
    });
}
