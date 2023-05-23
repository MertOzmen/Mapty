'use strict';

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks = 0;

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }

  _setDescription() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  click() {
    this.clicks++;
  }
}

class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

//////////////////////////////////////////////////////////////////////
// APPLICATION ARCHITECTURE

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const workoutTitle = document.querySelector('.workout__title');

//Modal
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.close-modal');
const btnOpenModal = document.querySelectorAll('.show-modal');

//Form-modal
const formModal = document.querySelector('.form-modal');
const mFormInputType = document.querySelector('.modal-form__input--type');
const mFormInputDistance = document.querySelector(
  '.modal-form__input--distance'
);
const mFormIinputDuration = document.querySelector(
  '.modal-form__input--duration'
);
const mFormInputCadence = document.querySelector('.modal-form__input--cadence');
const mFormInputElevation = document.querySelector(
  '.modal-form__input--elevation'
);

class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];

  constructor() {
    // get users position
    this._getPositon();

    //Get data from local storage
    this._getLocalStorage();
    // Attach event handlers
    form.addEventListener('submit', this._newWorkout.bind(this));
    formModal.addEventListener('submit', this._updateWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    mFormInputType.addEventListener('change', this._mToggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }

  _getPositon() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Location not found');
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _openModal(e) {
    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
    const workoutItem = e.target.closest('.workout--edit');

    if (!workoutItem) return;
    const workoutModal = this.#workouts.find(
      work => work.id === workoutItem.dataset.id
    );
    mFormInputType.value = workoutModal.type;
    mFormInputDistance.value = workoutModal.distance;
    mFormIinputDuration.value = workoutModal.duration;
    this._mToggleElevationField();
    if (workoutModal.type === 'running') {
      mFormInputCadence.value = workoutModal.cadence;
    }
    if (workoutModal.type === 'cycling') {
      mFormInputElevation.value = workoutModal.elevationGain;
    }
    formModal.dataset.id = workoutModal.id;
  }

  _closeModal() {
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
    // document.querySelector('.form-modal').remove();
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _mToggleElevationField() {
    mFormInputElevation
      .closest('.form__row')
      .classList.toggle('form__row--hidden');
    mFormInputCadence
      .closest('.form__row')
      .classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validInputs = (...Inputs) =>
      Inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...Inputs) => Inputs.every(inp => inp > 0);
    e.preventDefault();

    // Get data  from form

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // If activity running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;

      // Check if data is valid
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers');

      workout = new Running([lat, lng], distance, duration, cadence);
    }
    // If activity cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    // Add  new object to workout array

    this.#workouts.push(workout);

    // Render workout on map as marker
    this._renderWorkoutMarker(workout);

    // Render workout on list
    this._renderWorkout(workout);

    //Hide form + Clear input fields
    this._hideForm();

    // Set local storage to all workouts
    this._setLocalStorage();
  }

  _updateWorkout() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const workoutModal = this.#workouts.find(
      work => work.id === formModal.dataset.id
    );
    const date = new Date();

    workoutModal.type = mFormInputType.value;
    workoutModal.distance = +mFormInputDistance.value;
    workoutModal.duration = +mFormIinputDuration.value;

    if (workoutModal.type === 'running') {
      workoutModal.cadence = +mFormInputCadence.value;
      workoutModal.pace = workoutModal.duration / workoutModal.distance;
    }
    this._mToggleElevationField();
    if (workoutModal.type === 'cycling') {
      workoutModal.elevationGain = +mFormInputElevation.value;
      workoutModal.speed = workoutModal.distance / (workoutModal.duration / 60);
    }

    workoutModal.description = `${workoutModal.type[0].toUpperCase()}${workoutModal.type.slice(
      1
    )} on ${months[date.getMonth()]} ${date.getDate()}`;

    Object.assign(
      this.#workouts.find(work => work.id === formModal.dataset.id),
      workoutModal
    );
    this._setLocalStorage();
    this._closeModal();
  }

  _deleteWorkout(e) {
    const workoutId = e.target.closest('.workout--edit');

    if (!workoutId) return;
    const workoutDelete = this.#workouts.find(
      work => work.id === workoutId.dataset.id
    );
    this.#workouts = this.#workouts.filter(workdel => {
      return workdel.id !== workoutDelete.id;
    });

    this._setLocalStorage();
    location.reload();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
    <li class="workout__item" >
    <div class="workout--edit" data-id="${workout.id}">
          <div class="workout__delete"><ion-icon name="trash-outline"></ion-icon></div>
          <div class="workout__edit"><ion-icon name="create-outline"></ion-icon></div>
        </div>
    <div class="workout workout--${workout.type}" data-id="${workout.id}">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;

    if (workout.type === 'running') {
      html += `<div class="workout__details">
      <span class="workout__icon">⚡</span>
      <span class="workout__value">${workout.pace.toFixed(1)}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
    </div>
    </li>
    `;
    }

    if (workout.type === 'cycling') {
      html += `
      <div class="workout__details">
      <span class="workout__icon">⚡</span>
      <span class="workout__value">${workout.speed.toFixed(1)}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevationGain}</span>
      <span class="workout__unit">m</span>
    </div>
    </div>
    </li>
    `;
    }

    form.insertAdjacentHTML('afterend', html);
    const workoutEdit = document.querySelector('.workout__edit');
    workoutEdit.addEventListener('click', this._openModal.bind(this));
    const workoutDelete = document.querySelector('.workout__delete');
    workoutDelete.addEventListener('click', this._deleteWorkout.bind(this));
  }
  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;
    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );
    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    // using the public interface
    // workout.click();
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();
