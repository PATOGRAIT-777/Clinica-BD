(function(){
  const BASE_API_URL = 'http://127.0.0.1:3000/api/mx-divisions';

  // DOM elements
  const stateSelect = document.getElementById('mx_state');
  const municipioSelect = document.getElementById('mx_municipio');
  const coloniaSelect = document.getElementById('mx_colonia');
  const cpInput = document.querySelector('input[name="cp"]');

  // Set year
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // Validation regexes
  const curpRegex = /^[A-ZÑ]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/i;
  const rfcRegex = /^([A-ZÑ&]{3,4})\d{6}([A-Z0-9]{3})?$/i;

  function regValNum(event) {
    const numeros = "1234567890";
    const tecla = String.fromCharCode(event.which || event.keyCode);
    if (numeros.indexOf(tecla) === -1) { alert("Por favor, ingresa solo números"); return false; }
    return true;
  }

  function regValText(event) {
    const letras = "abcdefghijklmnñopqrstuvwxyzABCDEFGHIJKLMNÑOPQRSTUVWXYZ ";
    const tecla = String.fromCharCode(event.which || event.keyCode);
    if (letras.indexOf(tecla) === -1) { alert("Por favor, ingresa solo texto"); return false; }
    return true;
  }

  // Expose validation functions globally
  window.regValNum = regValNum;
  window.regValText = regValText;

  // --- API FETCH FUNCTIONS (MX DIVISIONS) ---
  async function fetchStates() {
    try {
      if(!stateSelect) return;
      stateSelect.disabled = true;
      stateSelect.innerHTML = '<option value="">Cargando estados...</option>';
      const response = await fetch(`${BASE_API_URL}/states`);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const states = await response.json();
      stateSelect.innerHTML = '<option value="">-- Selecciona estado --</option>';
      states.sort((a,b)=>a.localeCompare(b,'es')).forEach(state => {
        const opt = document.createElement('option');
        opt.value = state;
        opt.textContent = state;
        stateSelect.appendChild(opt);
      });
      stateSelect.disabled = false;
    } catch (error) {
      console.error('Error fetching states:', error);
      showMessage('register-message','Error cargando estados. Recarga la página.','error');
      if(stateSelect) {
         stateSelect.innerHTML = '<option value="">-- Error al cargar --</option>';
         stateSelect.disabled = false;
      }
    }
  }

  async function fetchMunicipalities(state) {
    try {
      municipioSelect.disabled = true;
      municipioSelect.innerHTML = '<option value="">Cargando municipios...</option>';
      const response = await fetch(`${BASE_API_URL}/municipalities/${encodeURIComponent(state)}`);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const municipalities = await response.json();
      municipioSelect.innerHTML = '<option value="">-- Selecciona municipio --</option>';
      coloniaSelect.innerHTML = '<option value="">-- Selecciona colonia --</option>';
      cpInput.value = '';
      municipalities.sort((a,b)=>a.localeCompare(b,'es')).forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        municipioSelect.appendChild(opt);
      });
      municipioSelect.disabled = false;
      coloniaSelect.disabled = true;
    } catch (error) {
      console.error('Error fetching municipalities:', error);
      showMessage('register-message','Error cargando municipios.','error');
      municipioSelect.innerHTML = '<option value="">-- Error --</option>';
      municipioSelect.disabled = false;
    }
  }

  async function fetchColonias(state, municipio) {
    try {
      coloniaSelect.disabled = true;
      coloniaSelect.innerHTML = '<option value="">Cargando colonias...</option>';
      const response = await fetch(`${BASE_API_URL}/colonias/${encodeURIComponent(state)}/${encodeURIComponent(municipio)}`);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const colonias = await response.json(); 
      coloniaSelect.innerHTML = '<option value="">-- Selecciona colonia --</option>';
      cpInput.value = '';
      colonias.sort((x,y)=> (x.colonia||'').localeCompare(y.colonia||'','es')).forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.colonia;
        opt.textContent = c.colonia;
        opt.dataset.cp = c.codigo_postal;
        coloniaSelect.appendChild(opt);
      });
      coloniaSelect.disabled = false;
    } catch (error) {
      console.error('Error fetching colonias:', error);
      showMessage('register-message','Error cargando colonias.','error');
      coloniaSelect.innerHTML = '<option value="">-- Error --</option>';
      coloniaSelect.disabled = false;
    }
  }

  // Event Listeners for Location Selects
  stateSelect && stateSelect.addEventListener('change', () => {
    const selectedState = stateSelect.value;
    if (selectedState) fetchMunicipalities(selectedState);
    else {
      municipioSelect.innerHTML = '<option value="">-- Selecciona municipio --</option>';
      coloniaSelect.innerHTML = '<option value="">-- Selecciona colonia --</option>';
      cpInput.value = '';
    }
  });

  municipioSelect && municipioSelect.addEventListener('change', () => {
    const selectedState = stateSelect.value;
    const selectedMunicipio = municipioSelect.value;
    if (selectedState && selectedMunicipio) fetchColonias(selectedState, selectedMunicipio);
    else { coloniaSelect.innerHTML = '<option value="">-- Selecciona colonia --</option>'; cpInput.value = ''; }
  });

  coloniaSelect && coloniaSelect.addEventListener('change', () => {
    const selectedColoniaOption = coloniaSelect.options[coloniaSelect.selectedIndex];
    if (selectedColoniaOption && selectedColoniaOption.dataset.cp) cpInput.value = selectedColoniaOption.dataset.cp;
    else cpInput.value = '';
  });

  // Helper: Authorization header
  function authHeaders() {
    const headers = {};
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return headers;
  }

  // Initial load
  fetchStates();

  // --- LOGICA DEL REGISTRO (Register Form) ---
  const registerForm = document.querySelector('form[action="#register"]');
  if (registerForm) {
    registerForm.addEventListener('submit', async function(e){
      e.preventDefault();

      // Validations
      const curp = this.querySelector('input[name="curp"]').value.trim();
      const rfcInput = this.querySelector('input[name="rfc"]');
      const rfc = rfcInput ? rfcInput.value.trim() : '';
      const email = this.querySelector('input[name="email"]').value.trim();
      
      if(!curpRegex.test(curp)){ showMessage('register-message','CURP no válido.','error'); return false; }
      if(rfc && !rfcRegex.test(rfc)){ showMessage('register-message','RFC no válido.','error'); return false; }
      if(!/.+@.+\..+/.test(email)){ showMessage('register-message','Correo no válido.','error'); return false; }

      const pwd = this.querySelector('input[name="password"]').value || '';
      const pwd2 = this.querySelector('input[name="password_confirm"]').value || '';
      const accept = this.querySelector('input[name="accept_terms"]');
      
      if(pwd.length < 8){ showMessage('register-message','La contraseña debe tener al menos 8 caracteres.','error'); return false; }
      if(pwd !== pwd2){ showMessage('register-message','Las contraseñas no coinciden.','error'); return false; }
      if(accept && !accept.checked){ showMessage('register-message','Debes aceptar los términos.','error'); return false; }

      // Validar Selects de Ubicación
      if (stateSelect && !stateSelect.value) { showMessage('register-message','Selecciona un estado.','error'); return false; }
      if (municipioSelect && !municipioSelect.value) { showMessage('register-message','Selecciona un municipio.','error'); return false; }
      if (coloniaSelect && !coloniaSelect.value) { showMessage('register-message','Selecciona una colonia.','error'); return false; }

      const formData = new FormData(this);

      try {
        const response = await fetch('http://127.0.0.1:3000/api/auth/register', { method: 'POST', headers: authHeaders(), body: formData });
        const result = await response.json();
        
        if (response.ok) {
          if (result.token) localStorage.setItem('token', result.token);
          showMessage('register-message','¡Registro exitoso! ' + (result.message || 'Bienvenido'),'success');
          
          // REDIRECCIÓN REGISTRO:
          setTimeout(()=>{
            // Intentamos leer el rol desde la respuesta del servidor o el formulario
            const rol = (result.user && result.user.rol) ? result.user.rol : formData.get('role');
            
            // Lógica de roles
            if (rol === 'usuario' || rol === 'cliente') {
                window.location.href = 'regUser.html';
            } else if (['medico', 'admin', 'recepcionista'].includes(rol)) {
                window.location.href = 'regUserAdmin.html';
            } else {
                // Por defecto
                window.location.href = 'regUser.html';
            }
          }, 900);

        } else {
          showMessage('register-message','Error: ' + (result.message || JSON.stringify(result)),'error');
        }
      } catch (err) { console.error('Error:', err); alert('Error de conexión: ' + err.message); }
    });
  }

  // --- LOGICA DEL LOGIN (Login Form) ---
  const loginForm = document.querySelector('form[action="#login"]');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e){
      e.preventDefault();
      const emailInput = this.querySelector('input[name="usr"]');
      const passwordInput = this.querySelector('input[name="pass"]');
      if (!emailInput.value || !passwordInput.value) { showMessage('login-message','Ingresa correo y contraseña.','error'); return; }

      const loginData = { email: emailInput.value, password: passwordInput.value };
      try {
        const response = await fetch('http://127.0.0.1:3000/api/auth/login', {
          method: 'POST', headers: Object.assign({'Content-Type':'application/json'}, authHeaders()), body: JSON.stringify(loginData)
        });
        const result = await response.json();
        
        if (response.ok) {
          localStorage.setItem('token', result.token);
          showMessage('login-message','¡Bienvenido! ' + (result.user ? result.user.nombre_completo : ''),'success');
          
          // REDIRECCIÓN LOGIN:
          setTimeout(()=>{
            const rol = result.user ? result.user.rol : '';
            
            if (rol === 'usuario' || rol === 'cliente') {
                window.location.href = 'regUser.html';
            } else if (['medico', 'admin', 'recepcionista'].includes(rol)) {
                window.location.href = 'regUserAdmin.html';
            } else {
                // Si no coincide o es otro rol
                window.location.href = 'regUser.html';
            }
          }, 700);

        } else {
          showMessage('login-message','Error al entrar: ' + (result.message || JSON.stringify(result)),'error');
        }
      } catch (err) { console.error('Error login:', err); alert('No se pudo conectar con el servidor.'); }
    });
  }

})();

// UI message helper
function showMessage(id, text, type) {
  const el = document.getElementById(id);
  if (!el) return alert(text);
  el.textContent = text;
  el.className = 'form-message ' + (type === 'success' ? 'success' : 'error');
  el.style.display = 'block';
  if (type === 'success') {
    setTimeout(()=>{ el.style.display = 'none'; }, 3000);
  }
}