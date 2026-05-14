const deck = document.getElementById('main-deck'),
    btnRegister = document.getElementById('btn-register'),
    btnLogin = document.getElementById('btn-login'),
    form = document.getElementById('reg-form'),
    submitBtn = document.getElementById('submit-btn'),
    themeBtn = document.getElementById('theme-btn'),
    homeBtn = document.getElementById('home-btn'),
    customSelect = document.getElementById('custom-select'),
    selectTrigger = customSelect.querySelector('.select-trigger'),
    hiddenInput = document.getElementById('select-value');

let timeoutId = null,
    currentMode = 'register';

themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
});

homeBtn.addEventListener('click', () => {
    clearTimeout(timeoutId);
    timeoutId = null;
    window.removeEventListener('keydown', handleSpacePress);
    deck.className = "deck";
    setTimeout(() => {
        window.location.reload();
    }, 350);
});

btnRegister.addEventListener('click', (e) => {
    e.stopPropagation();
    if (timeoutId) clearTimeout(timeoutId);
    currentMode = 'register';
    deck.className = "deck state-2 mode-register";
    window.addEventListener('keydown', handleSpacePress);
    timeoutId = setTimeout(goToScreen3, 4500);
});

btnLogin.addEventListener('click', (e) => {
    e.stopPropagation();
    if (timeoutId) clearTimeout(timeoutId);
    currentMode = 'login';
    deck.className = "deck mode-login";
    setTimeout(() => {
        deck.className = "deck state-3 mode-login";
    }, 400);
});

function handleSpacePress(event) {
    if (event.code === "Space" || event.keyCode === 32) {
        event.preventDefault();
        clearTimeout(timeoutId);
        timeoutId = null;
        goToScreen3();
    }
}

function goToScreen3() {
    window.removeEventListener('keydown', handleSpacePress);
    deck.className = `deck mode-${currentMode}`;
    setTimeout(() => {
        deck.className = `deck state-3 mode-${currentMode}`;
    }, 400);
}

form.addEventListener('input', () => {
    let allFilled = true;
    const activeFields = deck.classList.contains('mode-login') 
        ? form.querySelectorAll('input:not([type="hidden"])') 
        : form.querySelectorAll('.required-field');

    activeFields.forEach(field => {
        if (field.value.trim() === "") allFilled = false;
    });

    if (allFilled) {
        submitBtn.classList.add('visible');
        deck.classList.add('form-ready');
    } else {
        submitBtn.classList.remove('visible');
        deck.classList.remove('form-ready');
    }
});

if (selectTrigger) {
    selectTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        customSelect.classList.toggle('active');
    });
}

customSelect.querySelectorAll('.option').forEach(option => {
    option.addEventListener('click', function(e) {
        e.stopPropagation();
        selectTrigger.textContent = this.textContent;
        selectTrigger.style.color = 'var(--text-white)';
        hiddenInput.value = this.getAttribute('data-value');
        customSelect.classList.remove('active');
        form.dispatchEvent(new Event('input'));
    });
});

document.addEventListener('click', () => {
    customSelect.classList.remove('active');
});
// Вставьте сюда вашу ссылку, которую выдал localtunnel (ОБЯЗАТЕЛЬНО БЕЗ слэша на конце)
const BACKEND_URL = 'https://school-bd.onrender.com'; 

submitBtn.addEventListener('click', async (e) => {
    e.preventDefault(); // Отменяем стандартную перезагрузку страницы
    
    // Блокируем кнопку, чтобы пользователь не кликал много раз
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Отправка на ПК...';

    // Собираем данные из инпутов (ищем по тексту в label)
    const inputGroups = form.querySelectorAll('.input-group');
    let userData = {
        mode: deck.classList.contains('mode-login') ? 'Авторизация' : 'Регистрация',
        name: '-',
        surname: '-',
        student_class: hiddenInput.value || '-', // Отправляем в Python как student_class
        password: '-'
    };

    inputGroups.forEach(group => {
        const label = group.querySelector('label');
        const input = group.querySelector('input:not([type="hidden"])');
        if (!label || !input) return;
        
        const labelText = label.textContent.toLowerCase();
        if (labelText.includes('имя')) userData.name = input.value.trim();
        if (labelText.includes('фамилия')) userData.surname = input.value.trim();
        if (labelText.includes('пароль')) userData.password = input.value.trim();
    });

     try {
        // Отправляем данные на глобальный HTTP-шлюз (обход любых блокировок портов)
        await fetch('webhook.site', {
            method: 'POST',
            mode: 'no-cors', // Полностью отключает блокировки CORS браузером
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(userData)
        });

        alert('Запрос отправлен! Проверьте папку с Python-скриптом.');
        homeBtn.click();
        
    } catch (err) {
        console.error(err);
        alert('Ошибка отправки: ' + err.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});
