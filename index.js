"use strict";

// <button class="create_task"></button>
// <input type="text" class="task_text" />
// <ul class="tasks"></ul>

//const fremkalder classes fra HTML og task_arr opretter et tomt array.
const task_input = document.querySelector(".task_text");
const createTask_btn = document.querySelector(".create_task");
const ul_elm = document.querySelector(".tasks");
const ul_fuldfort = document.querySelector(".fuldfort");
const task_arr = [];
const date = document.querySelector("#choosedate");
const weathercheck = document.querySelector("#weather");
const klok = new Date();

document.getElementById("klokken").innerHTML = klok;

createTask_btn.addEventListener("click", createTask);

function createTask() {
  // Forhindrer i at man kan tilføje en task, hvis inputfelt er tomt.
  if (task_input.value === "") {
    return;
  }

  const task_obj = {
    taskTxt: task_input.value,
    taskDone: false,
    outdoor: weathercheck.checked,
    taskDate: date.value,
    id: self.crypto.randomUUID(),
  };

  task_arr.push(task_obj);

  console.log("task_arr", task_arr);

  // Henter kun vejr information, hvis task er sat til outdoor
  if (task_obj.outdoor) {
    loadJson(task_obj);
  } else {
    renderList();
  }
}
// Vejr data bliver hentet fra open-meteo api, hvorefter det retuneres som Json-data
function loadJson(task) {
  fetch("https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m&daily=weather_code&forecast_days=10&models=dmi_seamless")
    .then((response) => response.json())
    .then((jsonData) => {
      prepareObjects(jsonData, task);
    });
}
// Tager den første index i arrayet og igennem if og else bliver vejrkoden oversat til tekst. Så vælges opgaven som udendøres, vil den vise vejeret for den valgte dag og vise den som tekst.
function prepareObjects(jsonData, task) {
  // Ved brug af IndexOf, finder den index af vejrkoden
  const weatherarray = jsonData.daily.time.indexOf(task.taskDate);

  //Ud fra den valgte dato i kalenderen, vil den finde vejeret for den valgte dato
  const weathercode = jsonData.daily.weather_code[weatherarray];

  //Da let står som tom string, vil den ikke vise på startskærmen
  let weatherText = "";
  //if og else siger at ud fra den bestemte vejrkode, skal den vise den valgte weatherText
  if (weathercode === 0) {
    weatherText = "Solskinsvejr";
  } else if (weathercode === 1) {
    weatherText = "Mest klart";
  } else if (weathercode === 2) {
    weatherText = "Delvist skyet";
  } else if (weathercode === 3) {
    weatherText = "Overskyet";
  } else if (weathercode === 63 || weathercode === 53 || weathercode === 55 || weathercode === 80 || weathercode === 51) {
    weatherText = "Regnvejr";
  }

  // Vejeret gemmes til opgaven som API hører til
  task.weather = weatherText;
  // renderList gør at funktionen kører igen, hvergang data opdateres
  renderList();
}

function renderList() {
  // Hvergang der tilføjes en ny opgave, sættes renderList for, med de tomme strings, for at der ikke skabes dubletter
  ul_elm.innerHTML = "";
  ul_fuldfort.innerHTML = "";
  // Tager alle task i array og laver en ny li class til HTML
  task_arr.forEach((task) => {
    const li = document.createElement("li");
    // Hvis opgaven markeres som fuldført sendes den ned til .fuldfort classen fra HTML
    if (task.taskDone) {
      li.innerHTML = `
      <p>${task.taskTxt}</p> <p>${task.taskDate}</p> <p>${task.weather}</p>
<button class="regrettask" title="Fortryd handling">✓</button>
    `;

      const regrettask = li.querySelector(".regrettask");
      regrettask.addEventListener("click", regretbutton);
      function regretbutton() {
        // task.taskDone retuneres som false igen og ryger derfor tilbage til sin "false" position
        task.taskDone = false;
        renderList();
      }
      ul_fuldfort.appendChild(li);
    } else {
      // Hvis checkboxen ikke er markeret af, vil opgaven stå som tilgænglig

      // Når vejeret fra Json vises som regnvejr, gør disabled og "" at opgaven ikke kan fuldføres hvis opgaven er sat som udendøres
      li.innerHTML = `
           
      <input type="checkbox"  title="Fuldfør opgave" ${task.taskDone ? "checked" : ""}
        ${task.outdoor && task.weather === "Regnvejr" ? "disabled" : ""}>
        <p class="opgavetekst">${task.taskTxt}</p>
         <p class= "datotekst">${task.taskDate}</p>
     
 ${task.outdoor ? `<span class="weatherresult">${task.weather || "Henter vejr..."}</span>` : `<span class="weatherresult">Ikke udendørs</span>`}

<button class="deletetask" title="Slet task">X</button>
`;

      const checkBox = li.querySelector('[type="checkbox"]');
      const buttondelete = li.querySelector(".deletetask");

      checkBox.addEventListener("click", (e) => {
        // preventDefault gør at brugeren selv kan håndterer javascriptet, så browseren ikke går ind og håndterer den samtidigt
        e.preventDefault();
        // ! betyder at det skal gøre det modsatte. Det betyder at hvis task.taskDone er false, så skal den gøres true, når man når trykker på checkbox knappen.
        // Det gør det muligt at en fuldført opgave, kan ryge tilbage som en original opgave igen.
        task.taskDone = !task.taskDone;
        renderList();
      });
      buttondelete.addEventListener("click", deletetask);
      function deletetask() {
        // task_arr.indexOf finder opgavens placering i arrayet
        const taskdelete = task_arr.indexOf(task);
        // task_arr.splice fjener opgaven.
        task_arr.splice(taskdelete, 1);
        renderList();
      }

      ul_elm.appendChild(li);
    }
  });
}
