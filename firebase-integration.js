// ============================================
// firebase-integration.js
// Полная интеграция с Firebase
// ============================================

// ============================================
// 1. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================
let currentUser = null;
let syncInterval = null;

// ============================================
// 2. ПРОВЕРКА СТАТУСА ПОЛЬЗОВАТЕЛЯ
// ============================================
function checkAuthState() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            console.log('✅ Пользователь вошел:', user.email);
            
            // Показываем приложение
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
            
            // Обновляем статус
            updateSyncStatus('☁️ Синхронизация...', '#f59e0b');
            
            // Загружаем данные
            loadDataFromCloud();
            
            // Запускаем авто-синхронизацию
            if (syncInterval) clearInterval(syncInterval);
            syncInterval = setInterval(syncDataToCloud, 5000);
            
            // Показываем email
            const userEmailEl = document.getElementById('user-email-display');
            if (userEmailEl) userEmailEl.textContent = user.email;
            
        } else {
            currentUser = null;
            console.log('❌ Пользователь вышел');
            
            document.getElementById('auth-container').style.display = 'flex';
            document.getElementById('app-container').style.display = 'none';
            
            if (syncInterval) {
                clearInterval(syncInterval);
                syncInterval = null;
            }
            
            updateSyncStatus('⏳ Ожидание входа', '#94a3b8');
        }
    });
}

// ============================================
// 3. ФУНКЦИИ ВХОДА
// ============================================

function loginWithEmail() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    
    if (!email || !password) {
        alert('⚠️ Заполните все поля');
        return;
    }
    
    const btn = document.querySelector('.login-btn');
    if (btn) { btn.textContent = '⏳ Вход...'; btn.disabled = true; }
    
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            if (btn) { btn.textContent = '✅ Вход выполнен'; }
        })
        .catch((error) => {
            alert('❌ Ошибка: ' + error.message);
            if (btn) { btn.textContent = '🚀 Войти'; btn.disabled = false; }
        });
}

function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const btn = document.querySelector('.google-btn');
    if (btn) { btn.textContent = '⏳ Загрузка...'; btn.disabled = true; }
    
    firebase.auth().signInWithPopup(provider)
        .then(() => {
            if (btn) { btn.textContent = '✅ Вход выполнен'; }
        })
        .catch((error) => {
            alert('❌ Ошибка: ' + error.message);
            if (btn) { btn.textContent = 'Войти через Google'; btn.disabled = false; }
        });
}

function logout() {
    if (!confirm('Выйти?')) return;
    firebase.auth().signOut();
}

// ============================================
// 4. РАБОТА С ДАННЫМИ
// ============================================

function getUserDataPath() {
    if (!currentUser) return null;
    return `teachers/${currentUser.uid}/data`;
}

async function loadDataFromCloud() {
    const path = getUserDataPath();
    if (!path) return;
    
    try {
        const snapshot = await firebase.database().ref(path).once('value');
        const cloudData = snapshot.val();
        
        if (cloudData) {
            data = { ...data, ...cloudData };
            console.log('📥 Данные загружены из облака');
            localStorage.setItem('teacher_pro_cloud_backup', JSON.stringify(data));
            refreshUI();
            updateSyncStatus('✅ Данные загружены', '#22c55e');
        } else {
            // Если в облаке пусто, загружаем из localStorage
            const localData = localStorage.getItem('teacher_pro_v6_noclass');
            if (localData) {
                data = { ...data, ...JSON.parse(localData) };
                await syncDataToCloud();
            }
            refreshUI();
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
        // Пробуем из localStorage
        const localData = localStorage.getItem('teacher_pro_v6_noclass');
        if (localData) {
            data = { ...data, ...JSON.parse(localData) };
            refreshUI();
        }
        updateSyncStatus('⚠️ Офлайн-режим', '#f59e0b');
    }
}

async function syncDataToCloud() {
    const path = getUserDataPath();
    if (!path || !currentUser) return;
    
    try {
        const dataToSync = {
            ...data,
            _metadata: {
                lastUpdated: new Date().toISOString(),
                user: currentUser.email,
                version: '1.0.0'
            }
        };
        
        await firebase.database().ref(path).set(dataToSync);
        console.log('☁️ Данные синхронизированы');
        updateSyncStatus('☁️ Синхронизировано ' + new Date().toLocaleTimeString(), '#22c55e');
        localStorage.setItem('teacher_pro_cloud_backup', JSON.stringify(dataToSync));
        
    } catch (error) {
        console.error('❌ Ошибка синхронизации:', error);
        updateSyncStatus('⚠️ Ошибка синхронизации', '#ef4444');
    }
}

// ============================================
// 5. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

function updateSyncStatus(message, color = '#94a3b8') {
    const el1 = document.getElementById('sync-status');
    const el2 = document.getElementById('sync-status-header');
    if (el1) { el1.textContent = message; el1.style.color = color; }
    if (el2) { el2.textContent = message; el2.style.color = color; }
}

function refreshUI() {
    if (typeof renderHome === 'function') renderHome();
    if (typeof renderGradebook === 'function') renderGradebook();
    if (typeof renderStudentList === 'function') renderStudentList();
    if (typeof renderAttendance === 'function') renderAttendance();
    if (typeof renderProgress === 'function') renderProgress();
    if (typeof renderSocialPassport === 'function') renderSocialPassport();
    if (typeof renderPlan === 'function') renderPlan();
    if (typeof renderSchedule === 'function') renderSchedule();
    if (typeof renderReminderList === 'function') renderReminderList();
    if (typeof renderCalendar === 'function') renderCalendar();
    if (typeof renderSelects === 'function') renderSelects();
    if (typeof renderSettings === 'function') renderSettings();
    console.log('✅ Интерфейс обновлен');
}

// ============================================
// 6. СОХРАНЕНИЕ ДАННЫХ (ОСНОВНАЯ ФУНКЦИЯ)
// ============================================

function saveData() {
    localStorage.setItem('teacher_pro_v6_noclass', JSON.stringify(data));
    syncDataToCloud();
    refreshUI();
}

// ============================================
// 7. ЗАПУСК
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Загрузка Firebase интеграции...');
    checkAuthState();
});

// Делаем функции глобальными
window.loginWithEmail = loginWithEmail;
window.loginWithGoogle = loginWithGoogle;
window.logout = logout;
window.saveData = saveData;
window.syncDataToCloud = syncDataToCloud;
window.loadDataFromCloud = loadDataFromCloud;
window.refreshUI = refreshUI;
window.updateSyncStatus = updateSyncStatus;

console.log('✅ Firebase интеграция готова');
