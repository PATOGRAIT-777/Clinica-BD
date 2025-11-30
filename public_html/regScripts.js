// Cargar JSON con fetch
let razas = {};

fetch("razas.json")
  .then(response => response.json())
  .then(data => {
    razas = data;
  })
  .catch(error => console.error("Error cargando razas:", error));

// Detectar cambios en select "tipo"
document.getElementById("tipo").addEventListener("change", function () {
  let tipo = this.value;
  let razaSelect = document.getElementById("raza");
  let nombreInput = document.getElementById("nombre");
  let fechaInput = document.getElementById("fecha");
  let boton = document.querySelector(".reg-btn-submit");

  // Resetear lista de razas
  razaSelect.innerHTML = "<option value=''>-- Selecciona raza --</option>";

  if (razas[tipo]) {
    // Llenar select con las razas del tipo elegido
    razas[tipo].forEach(r => {
      let option = document.createElement("option");
      option.value = r;
      option.textContent = r;
      razaSelect.appendChild(option);
    });

    // Mostrar campos
    razaSelect.classList.remove("hidden");
    nombreInput.classList.remove("hidden");
    fechaInput.classList.remove("hidden");
    boton.classList.remove("hidden");
  } else {
    // Ocultar si no hay tipo válido
    razaSelect.classList.add("hidden");
    nombreInput.classList.add("hidden");
    fechaInput.classList.add("hidden");
    boton.classList.add("hidden");
  }
});
