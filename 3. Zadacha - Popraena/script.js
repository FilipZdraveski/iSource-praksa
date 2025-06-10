let nav = {
    month: 0,
    week: 0,
    day: 0
};
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

    const eventsForDay = events.filter(e => e.date === clicked);

    if (eventsForDay.length > 0) {
        // Show all events for the day
        const eventsList = document.createElement('div');
        eventsList.className = 'events-list';

        eventsForDay.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.className = 'event-item';
            eventDiv.innerHTML = `
                <div class="event-title">${event.time ? `${event.time} - ${event.title}` : `ALL DAY - ${event.title}`}</div>
                <div class="event-actions">
                    <button class="edit-event" data-event-id="${events.indexOf(event)}">Edit</button>
                    <button class="delete-event" data-event-id="${events.indexOf(event)}">Delete</button>
                </div>
            `;
            eventsList.appendChild(eventDiv);
        });

        // Add "Add New Event" button
        const addNewEventDiv = document.createElement('div');
        addNewEventDiv.className = 'event-item add-new-event';
        addNewEventDiv.innerHTML = `
            <button class="add-event-btn">+ Add New Event</button>
        `;
        eventsList.appendChild(addNewEventDiv);

        document.getElementById('eventText').innerHTML = '';
        document.getElementById('eventText').appendChild(eventsList);
        deleteEventModal.style.display = 'block';

        // Add event listeners for edit and delete buttons
        eventsList.querySelectorAll('.edit-event').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventIndex = parseInt(button.dataset.eventId);
                const event = events[eventIndex];
                deleteEventModal.style.display = 'none';
                newEventModal.style.display = 'block';
                eventTitle.value = event.title;
                eventTime.value = event.time || '';
                isEditing = true;
                // Store the event index for editing
                clicked = { date, eventIndex };
            });
        });

        eventsList.querySelectorAll('.delete-event').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventIndex = parseInt(button.dataset.eventId);
                events.splice(eventIndex, 1);
                localStorage.setItem('events', JSON.stringify(events));
                closeModal();
            });
        });

        // Add event listener for "Add New Event" button
        const addEventBtn = eventsList.querySelector('.add-event-btn');
        addEventBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteEventModal.style.display = 'none';
            newEventModal.style.display = 'block';
            eventTitle.value = '';
            eventTime.value = '';
            isEditing = false;
            clicked = date; // Reset clicked to just the date for new event
        });
    } else {
        newEventModal.style.display = 'block';
        document.getElementById('editButton').style.display = 'none';
        isEditing = false;
    }

    backDrop.style.display = 'block';
}

function load() {
    clicked = null;
    newEventModal.style.display = 'none';
    deleteEventModal.style.display = 'none';
    backDrop.style.display = 'none';
    const date = new Date();

    if (nav[currentView] !== 0) {
        if (currentView === 'month') {
            date.setMonth(new Date().getMonth() + nav.month);
        } else if (currentView === 'week') {
            date.setDate(new Date().getDate() + (nav.week * 7));
        } else if (currentView === 'day') {
            date.setDate(new Date().getDate() + nav.day);
        }
    }

    // Update date picker value
    const datePicker = document.getElementById('datePicker');
    datePicker.value = date.toISOString().split('T')[0];

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

            if (currentDay === day && nav[currentView] === 0) {
                daySquare.classList.add('current');
            }

            const eventsForDay = events.filter(e => e.date === dayString);
            if (eventsForDay.length > 0) {
                const eventsContainer = document.createElement('div');
                eventsContainer.className = 'events-container';

                eventsForDay.forEach(event => {
                    const eventDiv = document.createElement('div');
                    eventDiv.classList.add('event');
                    eventDiv.innerText = event.time ? `${event.time} - ${event.title}` : `ALL DAY - ${event.title}`;
                    eventsContainer.appendChild(eventDiv);
                });

                daySquare.appendChild(eventsContainer);
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

        if (dayEvents.length > 0) {
            const eventsContainer = document.createElement('div');
            eventsContainer.className = 'events-container';

            dayEvents.forEach(event => {
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('event');
                eventDiv.innerText = event.time ? `${event.time} - ${event.title}` : `ALL DAY - ${event.title}`;
                eventsContainer.appendChild(eventDiv);
            });

            dayColumn.appendChild(eventsContainer);
        }

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
            eventDiv.innerText = event.time ? `${event.time} - ${event.title}` : `ALL DAY - ${event.title}`;
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

        if (isEditing) {
            // Update existing event
            const eventIndex = typeof clicked === 'object' ? clicked.eventIndex : events.findIndex(e => e.date === clicked);
            if (eventIndex !== -1) {
                events[eventIndex] = {
                    date: typeof clicked === 'object' ? clicked.date : clicked,
                    title: eventTitle.value,
                    time: eventTime.value
                };
            }
        } else {
            // Add new event
            events.push({
                date: clicked,
                title: eventTitle.value,
                time: eventTime.value
            });
        }

        localStorage.setItem('events', JSON.stringify(events));
        closeModal();
    } else {
        eventTitle.classList.add('error');
    }
}

function editEvent() {
    if (eventTitle.value) {
        eventTitle.classList.remove('error');
        const eventIndex = typeof clicked === 'object' ? clicked.eventIndex : events.findIndex(e => e.date === clicked);
        if (eventIndex !== -1) {
            events[eventIndex] = {
                date: typeof clicked === 'object' ? clicked.date : clicked,
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
        nav[currentView]++;
        load();
    });
    document.getElementById('backButton').addEventListener('click', () => {
        nav[currentView]--;
        load();
    });

    // Add date picker functionality
    const datePicker = document.getElementById('datePicker');
    datePicker.addEventListener('change', (e) => {
        const selectedDate = new Date(e.target.value);
        const currentDate = new Date();

        if (currentView === 'month') {
            nav.month = (selectedDate.getMonth() - currentDate.getMonth()) +
                ((selectedDate.getFullYear() - currentDate.getFullYear()) * 12);
        } else if (currentView === 'week') {
            const diffTime = selectedDate - currentDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            nav.week = Math.floor(diffDays / 7);
        } else if (currentView === 'day') {
            const diffTime = selectedDate - currentDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            nav.day = diffDays;
        }

        load();
        // Open the new event modal for the selected date
        const dayString = `${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`;
        openModal(dayString);
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
