document.addEventListener('DOMContentLoaded', () => {
    // STATE
    let schedule = JSON.parse(localStorage.getItem('mySchedule')) || [];
    let currentDayFilter = 'all';
    let currentTypeFilter = 'all';

    const daysOrder = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];

    // DOM ELEMENTS
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const scheduleForm = document.getElementById('scheduleForm');
    const daysContainer = document.getElementById('daysContainer');
    const emptyState = document.getElementById('emptyState');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const typeFilterSelect = document.getElementById('typeFilter');

    // STATS ELEMENTS
    const statTotal = document.getElementById('statTotal');
    const statLessons = document.getElementById('statLessons');
    const statClubs = document.getElementById('statClubs');

    // EDIT MODAL ELEMENTS
    const editModal = document.getElementById('editModal');
    const editForm = document.getElementById('editForm');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');

    // --- DARK MODE LOGIC ---
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        if (theme === 'dark') {
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i> <span>Kunduzgi rejim</span>';
        } else {
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i> <span>Tungi rejim</span>';
        }
    }

    // --- ADD FORM SUBMIT ---
    scheduleForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newItem = {
            id: Date.now(),
            title: document.getElementById('title').value.trim(),
            type: document.getElementById('type').value,
            day: document.getElementById('day').value,
            startTime: document.getElementById('startTime').value,
            endTime: document.getElementById('endTime').value,
            room: document.getElementById('room').value.trim(),
            teacher: document.getElementById('teacher').value.trim()
        };

        schedule.push(newItem);
        saveAndRender();
        scheduleForm.reset();
    });

    // --- EDIT MODAL LOGIC ---
    window.openEditModal = function(id) {
        const item = schedule.find(i => i.id === id);
        if (!item) return;

        document.getElementById('editId').value = item.id;
        document.getElementById('editTitle').value = item.title;
        document.getElementById('editType').value = item.type;
        document.getElementById('editDay').value = item.day;
        document.getElementById('editStartTime').value = item.startTime;
        document.getElementById('editEndTime').value = item.endTime;
        document.getElementById('editRoom').value = item.room;
        document.getElementById('editTeacher').value = item.teacher || '';

        editModal.style.display = 'flex';
    };

    function closeEditModal() {
        editModal.style.display = 'none';
        editForm.reset();
    }

    closeModalBtn.addEventListener('click', closeEditModal);
    cancelModalBtn.addEventListener('click', closeEditModal);

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = Number(document.getElementById('editId').value);
        const index = schedule.findIndex(i => i.id === id);

        if (index !== -1) {
            schedule[index] = {
                id: id,
                title: document.getElementById('editTitle').value.trim(),
                type: document.getElementById('editType').value,
                day: document.getElementById('editDay').value,
                startTime: document.getElementById('editStartTime').value,
                endTime: document.getElementById('editEndTime').value,
                room: document.getElementById('editRoom').value.trim(),
                teacher: document.getElementById('editTeacher').value.trim()
            };

            saveAndRender();
            closeEditModal();
        }
    });

    // --- DELETE ITEM ---
    window.deleteItem = function(id) {
        if(confirm("Ushbu mashg'ulotni o'chirishni xohlaysizmi?")) {
            schedule = schedule.filter(item => item.id !== id);
            saveAndRender();
        }
    };

    // --- RENDER FUNCTION BY DAYS ---
    function render() {
        daysContainer.innerHTML = '';

        // Filter items
        const filteredSchedule = schedule.filter(item => {
            const matchesDay = currentDayFilter === 'all' || item.day === currentDayFilter;
            const matchesType = currentTypeFilter === 'all' || item.type === currentTypeFilter;
            return matchesDay && matchesType;
        });

        if (filteredSchedule.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
        }

        // Group items by Day
        daysOrder.forEach(dayName => {
            const dayItems = filteredSchedule.filter(i => i.day === dayName);

            if (dayItems.length > 0) {
                // Sort items by Start Time
                dayItems.sort((a, b) => a.startTime.localeCompare(b.startTime));

                const daySection = document.createElement('div');
                daySection.className = 'day-section';

                let cardsHtml = '';
                dayItems.forEach(item => {
                    const isDars = item.type === 'dars';
                    const tagClass = isDars ? 'tag-dars' : 'tag-togarak';
                    const tagText = isDars ? 'Maktab Darsi' : 'To\'garak';

                    cardsHtml += `
                        <div class="card">
                            <div>
                                <div class="card-header">
                                    <span class="card-tag ${tagClass}">${tagText}</span>
                                </div>
                                <h3 class="card-title">${item.title}</h3>
                                <div class="card-info" style="margin-top: 0.75rem;">
                                    <div><i class="fa-regular fa-clock"></i> <b>${item.startTime} - ${item.endTime}</b></div>
                                    <div><i class="fa-solid fa-location-dot"></i> ${item.room}</div>
                                    ${item.teacher ? `<div><i class="fa-solid fa-user-tie"></i> ${item.teacher}</div>` : ''}
                                </div>
                            </div>

                            <!-- O'ZGARTIRISH VA O'CHIRISH TUGMALARI -->
                            <div class="card-bottom-actions">
                                <button class="btn-card-edit" onclick="openEditModal(${item.id})">
                                    <i class="fa-solid fa-pen-to-square"></i> O'zgartirish
                                </button>
                                <button class="btn-card-delete" onclick="deleteItem(${item.id})" title="O'chirish">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                        </div>
                    `;
                });

                daySection.innerHTML = `
                    <div class="day-header">
                        <i class="fa-solid fa-calendar-day"></i> ${dayName}
                    </div>
                    <div class="cards-grid">
                        ${cardsHtml}
                    </div>
                `;

                daysContainer.appendChild(daySection);
            }
        });

        updateStats();
    }

    // --- UPDATE STATS ---
    function updateStats() {
        statTotal.textContent = schedule.length;
        statLessons.textContent = schedule.filter(i => i.type === 'dars').length;
        statClubs.textContent = schedule.filter(i => i.type === 'togarak').length;
    }

    // --- SAVE AND RENDER ---
    function saveAndRender() {
        localStorage.setItem('mySchedule', JSON.stringify(schedule));
        render();
    }

    // --- FILTERS ---
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDayFilter = btn.getAttribute('data-day');
            render();
        });
    });

    typeFilterSelect.addEventListener('change', (e) => {
        currentTypeFilter = e.target.value;
        render();
    });

    // INITIAL RENDER
    render();
});