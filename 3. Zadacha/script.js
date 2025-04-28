let nav = 0;
let isEditing = false;
let clicked = null;
let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];
let currentView = 'month';

const calendar = document.getElementById('calendar');
const newEventModal = document.getElementById('newEventModal');
const deleteEventModal = document.getElementById('deleteEventModal');
const backDrop = document.getElementById('modalBackDrop');
const eventTitle = document.getElementById('eventTitle');
const eventTime = document.getElementById('eventTime');
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function openModal(date) {
    clicked = date;

    const eventForDay = events.find(e => e.date === clicked);

    if (eventForDay) {
        document.getElementById('eventText').innerText = eventForDay.title;
        document.getElementById('eventTimeDisplay').innerText = eventForDay.time;
        deleteEventModal.style.display = 'block';

        const editButton = document.getElementById('editButton');
        editButton.style.display = 'block';
        editButton.onclick = () => {
            deleteEventModal.style.display = 'none';
            newEventModal.style.display = 'block';
            eventTitle.value = eventForDay.title;
            eventTime.value = eventForDay.time;
            isEditing = true;
        };
    } else {
        newEventModal.style.display = 'block';
        document.getElementById('editButton').style.display = 'none';
        isEditing = false;
    }

    if (eventForDay.time) {
        document.getElementById('eventTimeDisplay').innerText = eventForDay.time;
        document.getElementById('eventTimeDisplay').style.display = 'block';
    } else {
        document.getElementById('eventTimeDisplay').style.display = 'none';
    }

    backDrop.style.display = 'block';
}

function load() {
    clicked = null;
    newEventModal.style.display = 'none';
    deleteEventModal.style.display = 'none';
    backDrop.style.display = 'none';
    const date = new Date();

    if (nav !== 0) {
        if (currentView === 'month') {
            date.setMonth(new Date().getMonth() + nav);
        } else if (currentView === 'week') {
            date.setDate(new Date().getDate() + (nav * 7));
        } else if (currentView === 'day') {
            date.setDate(new Date().getDate() + nav);
        }
    }

    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    document.getElementById('monthDisplay').innerText =
        `${date.toLocaleDateString('en-us', { month: 'long' })} ${year}`;

    calendar.innerHTML = '';

    if (currentView === 'month') {
        loadMonthView(date, day, month, year);
    } else if (currentView === 'week') {
        loadWeekView(date);
    } else if (currentView === 'day') {
        loadDayView(date);
    }
}

function loadMonthView(date, day, month, year) {
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
        weekday: 'long',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    });
    const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

    // Days from next month
    const totalDays = paddingDays + daysInMonth;
    const nextMonthPadding = 7 - (totalDays % 7);
    const totalDaysToShow = totalDays + (nextMonthPadding === 7 ? 0 : nextMonthPadding);

    const monthContainer = document.createElement('div');
    monthContainer.className = 'month-view';

    for (let i = 1; i <= totalDaysToShow; i++) {
        const daySquare = document.createElement('div');
        daySquare.className = 'month-day';

        if (i <= paddingDays) {
            // Previous month 
            const prevMonth = new Date(year, month, 0);
            const prevMonthDay = prevMonth.getDate() - paddingDays + i;
            const dayHeader = document.createElement('div');
            dayHeader.className = 'month-day-header';
            dayHeader.innerText = prevMonthDay;
            daySquare.appendChild(dayHeader);
            daySquare.classList.add('padding');
        } else if (i > paddingDays + daysInMonth) {
            // Next month
            const nextMonthDay = i - (paddingDays + daysInMonth);
            const dayHeader = document.createElement('div');
            dayHeader.className = 'month-day-header';
            dayHeader.innerText = nextMonthDay;
            daySquare.appendChild(dayHeader);
            daySquare.classList.add('padding');
        } else {
            // Current month
            const currentDay = i - paddingDays;
            const dayString = `${currentDay}/${month + 1}/${year}`;

            const dayHeader = document.createElement('div');
            dayHeader.className = 'month-day-header';
            dayHeader.innerText = currentDay;
            daySquare.appendChild(dayHeader);

            if (currentDay === day && nav === 0) {
                daySquare.classList.add('current');
            }

            const eventForDay = events.find(e => e.date === dayString);
            if (eventForDay) {
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('event');
                eventDiv.innerText = eventForDay.time ? `${eventForDay.time} - ${eventForDay.title}` : eventForDay.title;
                daySquare.appendChild(eventDiv);
            }

            daySquare.addEventListener('click', () => openModal(dayString));
        }

        monthContainer.appendChild(daySquare);
    }

    calendar.appendChild(monthContainer);
}

function loadWeekView(date) {
    // Get the start of the week (Sunday)
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    // Create a container for the week view
    const weekContainer = document.createElement('div');
    weekContainer.className = 'week-view';

    // Create a day column for each day of the week
    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + i);

        const dayColumn = document.createElement('div');
        dayColumn.className = 'week-day';

        const dayHeader = document.createElement('div');
        dayHeader.className = 'week-day-header';
        dayHeader.innerText = `${weekdays[i]}\n${dayDate.getDate()}, ${dayDate.toLocaleString('default', { month: 'short' })}`;

        const dayString = `${dayDate.getDate()}/${dayDate.getMonth() + 1}/${dayDate.getFullYear()}`;
        const dayEvents = events.filter(e => e.date === dayString);

        dayColumn.appendChild(dayHeader);

        dayEvents.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.classList.add('event');
            eventDiv.innerText = event.time ? `${event.time} - ${event.title}` : event.title;
            dayColumn.appendChild(eventDiv);
        });

        dayColumn.addEventListener('click', () => openModal(dayString));
        weekContainer.appendChild(dayColumn);
    }

    calendar.appendChild(weekContainer);
}

function loadDayView(date) {
    const dayString = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    const dayEvents = events.filter(e => e.date === dayString);

    const dayContainer = document.createElement('div');
    dayContainer.className = 'day-view';

    const dayHeader = document.createElement('h2');
    dayHeader.className = 'day-view-header';
    dayHeader.innerText = `${weekdays[date.getDay()]}, ${date.toLocaleDateString('en-us', { month: 'long', day: 'numeric', year: 'numeric' })}`;
    dayContainer.appendChild(dayHeader);

    const eventsContainer = document.createElement('div');
    eventsContainer.className = 'day-view-events';

    if (dayEvents.length === 0) {
        const noEvents = document.createElement('div');
        noEvents.className = 'no-events';
        noEvents.innerText = 'No events for this day';
        eventsContainer.appendChild(noEvents);
    } else {
        dayEvents.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.classList.add('event');
            eventDiv.innerText = event.time ? `${event.time} - ${event.title}` : event.title;
            eventsContainer.appendChild(eventDiv);
        });
    }

    dayContainer.appendChild(eventsContainer);
    dayContainer.addEventListener('click', () => openModal(dayString));
    calendar.appendChild(dayContainer);
}

function closeModal() {
    eventTitle.classList.remove('error');
    newEventModal.style.display = 'none';
    deleteEventModal.style.display = 'none';
    backDrop.style.display = 'none';
    eventTitle.value = '';
    eventTime.value = '';
    clicked = null;
    isEditing = false;
    load();
}

function saveEvent() {
    if (eventTitle.value) {
        eventTitle.classList.remove('error');
        events.push({
            date: clicked,
            title: eventTitle.value,
            time: eventTime.value
        })

        localStorage.setItem('events', JSON.stringify(events));
        closeModal();
    } else {
        eventTitle.classList.add('error');
    }
}

function editEvent() {
    if (eventTitle.value) {
        eventTitle.classList.remove('error');
        // Find the event to edit
        const eventIndex = events.findIndex(e => e.date === clicked);
        if (eventIndex !== -1) {
            // Update the event
            events[eventIndex] = {
                date: clicked,
                title: eventTitle.value,
                time: eventTime.value
            };
            localStorage.setItem('events', JSON.stringify(events));
            closeModal();
        }
    } else {
        eventTitle.classList.add('error');
    }
}

function deleteEvent() {
    events = events.filter(e => e.date !== clicked);
    localStorage.setItem('events', JSON.stringify(events));
    closeModal();
}

function initButtons() {
    document.getElementById('nextButton').addEventListener('click', () => {
        nav++;
        load();
    });
    document.getElementById('backButton').addEventListener('click', () => {
        nav--;
        load();
    });

    // Add view toggle functionality
    document.querySelectorAll('.toggle-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentView = button.dataset.view;
            load();
        });
    });

    document.getElementById('saveButton').addEventListener('click', function () {
        if (isEditing) {
            editEvent();
        } else {
            saveEvent();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && newEventModal.style.display === 'block') {
            e.preventDefault();
            if (isEditing) {
                editEvent();
            } else {
                saveEvent();
            }
        }
    });

    document.getElementById('cancelButton').addEventListener('click', closeModal);

    document.getElementById('deleteButton').addEventListener('click', deleteEvent);

    document.getElementById('closeButton').addEventListener('click', closeModal);

    document.getElementById('editButton').addEventListener('click', editEvent);

}

initButtons();
load();