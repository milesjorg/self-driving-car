const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 300;

const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 1000;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

function run() {
  runAnimation();
  setUserInputs();
  let bestCar = cars[0];
}

function runAnimation() {
  var id = window.requestAnimationFrame(animate);
  while (id--) {
    window.cancelAnimationFrame(id)
  }
}

function setUserInputs() {
  traffic = createTraffic(getInputFromLocalStorage("traffic"));
  cars = generateCars(getInputFromLocalStorage("genSize"));

  if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
      cars[i].brain = getInputFromLocalStorage("bestBrain");
      if (i != 0) {
        NeuralNetwork.mutate(cars[i].brain, getInputFromLocalStorage("mutationValue"));
      }
    }
  }
}

function saveInputsToLocalStorage() {
  localStorage.setItem(
    "turnSensitivity",
    JSON.stringify(document.getElementById("turnSensitivity").value)
  );
  localStorage.setItem(
    "maxSpeed",
    JSON.stringify(document.getElementById("maxSpeed").value)
  );
  localStorage.setItem(
    "numRays",
    JSON.stringify(document.getElementById("numRays").value)
  );
  localStorage.setItem(
    "rayLength",
    JSON.stringify(document.getElementById("rayLength").value)
  );
  localStorage.setItem(
    "traffic",
    JSON.stringify(document.getElementById("traffic").value)
  );
  localStorage.setItem(
    "genSize",
    JSON.stringify(document.getElementById("genSize").value)
  );
  localStorage.setItem(
    "mutationValue",
    JSON.stringify(document.getElementById("mutationValue").value)
  );
}

// fills values from localStorage if exists
function fillFormFields() {
  if (localStorage.getItem("maxSpeed") != "") {
    document.getElementById("turnSensitivity").value =
      getInputFromLocalStorage("turnSensitivity");
    document.getElementById("maxSpeed").value =
      getInputFromLocalStorage("maxSpeed");
    document.getElementById("numRays").value =
      getInputFromLocalStorage("numRays");
    document.getElementById("rayLength").value =
      getInputFromLocalStorage("rayLength");
    document.getElementById("traffic").value =
      getInputFromLocalStorage("traffic");
    document.getElementById("genSize").value =
      getInputFromLocalStorage("genSize");
    document.getElementById("mutationValue").value =
      getInputFromLocalStorage("mutationValue");
  }
}

function getInputFromLocalStorage(input) {
  return JSON.parse(localStorage.getItem(input));
}

function saveBrain() {
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discardBrain() {
  localStorage.removeItem("bestBrain");
}

function generateCars(N) {
  const cars = [];
  for (let i = 0; i < N; i++) {
    cars.push(
      new Car(
        road.getLaneCenter(1),
        100,
        30,
        50,
        "AI",
        getInputFromLocalStorage("maxSpeed"),
        getInputFromLocalStorage("turnSensitivity"),
        getInputFromLocalStorage("rayLength"),
        getInputFromLocalStorage("numRays"),
        "chartreuse"
      )
    );
  }
  return cars;
}

function createTraffic(amountCars) {
  const traffic = [];
  for (let i = 1; i < amountCars; i++) {
    traffic.push(
      new Car(
        road.getLaneCenter(Math.floor(Math.random() * 4)),
        -i * 110,
        30,
        50,
        "BOT",
        2,
        0,
        0,
        0,
        getRandomColor()
      )
    );
  }
  return traffic;
}

// mess with this to fix run button multiple clicks
function animate(time) {
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, []);
  }

  for (let i = 0; i < cars.length; i++) {
    cars[i].update(road.borders, traffic);
  }
  bestCar = cars.find((c) => c.y == Math.min(...cars.map((c) => c.y)));

  carCanvas.height = innerHeight;
  networkCanvas.height = innerHeight;

  carCtx.save();
  carCtx.translate(0, -bestCar.y + carCanvas.height * 0.8);

  road.draw(carCtx);

  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(carCtx);
  }

  carCtx.globalAlpha = 0.2;
  for (let i = 0; i < cars.length; i++) {
    cars[i].draw(carCtx);
  }

  carCtx.globalAlpha = 1;
  bestCar.draw(carCtx, true);

  carCtx.restore();

  networkCtx.lineDashOffset = -time * 0.05;
  Visualizer.drawNetwork(networkCtx, bestCar.brain);
  requestAnimationFrame(animate);
}
