// Variables globales para almacenar las URLs de las imágenes subidas
let scanINEUrl = null;
let scanComprobanteDomicilioUrl = "https://firebasestorage.googleapis.com/v0/b/flutter-imgtxt.appspot.com/o/imagenes%2Fcomprobante-domicilio.jpg?alt=media&token=3b3b3b3b-3b3b-3b3b-3b3b-3b3b3b3b3b3b";

// Importa lo necesario desde Firebase (sin importar archivos manualmente)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-storage.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAjqpqfAGRXVWk28cBkYFEujUQWsNOBnmQ",
  authDomain: "flutter-imgtxt.firebaseapp.com",
  databaseURL: "https://flutter-imgtxt-default-rtdb.firebaseio.com",
  projectId: "flutter-imgtxt",
  storageBucket: "flutter-imgtxt.appspot.com",
  messagingSenderId: "406521536502",
  appId: "1:406521536502:web:7a684b0f2d12a7de94f1d7"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Función para mostrar la vista previa de la imagen seleccionada
function mostrarVistaPrevia() {
    const fileInput = document.getElementById('fileInput');
    const vistaPreviaContainer = document.getElementById('vistaPreviaContainer');
    const vistaPrevia = document.getElementById('vistaPrevia');

    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        
        if (!file.type.startsWith('image/')) {
            alert("Por favor selecciona un archivo de imagen.");
            fileInput.value = ""; // Limpiar el input
            return;
        }

        const reader = new FileReader();
        
        reader.onload = function(e) {
            vistaPrevia.src = e.target.result;
            vistaPreviaContainer.style.display = 'block'; // Mostrar la vista previa
        };

        reader.readAsDataURL(file);
    }
}

// Función para habilitar los campos del formulario
function habilitarCampos() {
    document.getElementById('nombre').disabled = false;
    document.getElementById('curp').disabled = false;
    document.getElementById('correo').disabled = false;
    document.getElementById('telefono').disabled = false;
}


// Función analizarINE modificada para ocultar la vista previa después de confirmar carga
async function analizarINE(imageUrl) {
    try {
        const response = await fetch('http://localhost:5088/api/INE/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageUrl })
        });
        const data = await response.json();
        
        if (data.success) {
            const resultText = data.result.replace(/```json|```/g, '').trim();
            const resultData = JSON.parse(resultText);

            // Asignar valores de nombre y CURP a los campos del formulario
            document.getElementById('nombre').value = resultData.name;
            document.getElementById('curp').value = resultData.curp;

            // Ocultar la vista previa después de confirmar la carga
            document.getElementById('vistaPreviaContainer').style.display = 'none';

            // Guarda la URL del INE en la variable global
            scanINEUrl = imageUrl;

            // Habilita los campos del formulario
            habilitarCampos();
            
        } else {
            console.error("Error en el análisis:", data);
            alert("Hubo un error en el análisis.");
        }
    } catch (error) {
        console.error('Error al analizar la imagen:', error);
        alert("Hubo un error al analizar la imagen.");
    }
}

// Función para subir la imagen a Firebase Storage y llamar a analizarINE con la URL
function subirImagen(file) {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, 'imagenes/' + file.name);
        const uploadTask = uploadBytesResumable(storageRef, file);

        // Muestra el loader al iniciar la carga
        const loaderContainer = document.getElementById('loaderContainer');
        const loaderText = document.getElementById('loaderText');
        loaderContainer.style.display = 'flex';

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Subiendo imagen: ' + progress + '%');

                // Actualiza el texto del porcentaje en el loader
                loaderText.textContent = Math.round(progress) + '%';
            },
            (error) => {
                console.error('Error al subir la imagen:', error);
                loaderContainer.style.display = 'none'; // Ocultar el loader si hay un error
                reject(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log('Imagen disponible en:', downloadURL);
                    loaderContainer.style.display = 'none'; // Ocultar el loader al finalizar
                    resolve(downloadURL);
                }).catch((error) => {
                    loaderContainer.style.display = 'none'; // Ocultar el loader si hay un error al obtener la URL
                    reject(error);
                });
            }
        );
    });
}

// Función para registrar al tutor
async function registrarTutor() {
    const nombre = document.getElementById('nombre').value;
    const curp = document.getElementById('curp').value;
    const telefono = document.getElementById('telefono').value;
    const email = document.getElementById('correo').value;

    // Asegúrate de que `scanINEUrl` ya tiene la URL después de subir la imagen
    const padreTutor = {
        Nombre: nombre,
        CURP: curp,
        ScanINE: scanINEUrl, // Usa la URL de la imagen cargada
        Telefono: telefono,
        Email: email,
        ScanComprobanteDomicilio: scanComprobanteDomicilioUrl // Agrega esto si tienes un segundo comprobante
    };

    try {
        const response = await fetch('http://localhost:5088/api/INE/registrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(padreTutor)
        });
        const result = await response.json();
        if (result.success) {
            alert("Registro exitoso");
        } else {
            alert("Error en el registro: " + result.message);
        }
    } catch (error) {
        console.error("Error al registrar el tutor:", error);
        alert("Error en el registro");
    }
}

// Llama a esta función cuando el usuario haga clic en el botón "Registrar"
document.querySelector('button[type="submit"]').addEventListener('click', (event) => {
    event.preventDefault(); // Evita el envío del formulario
    registrarTutor(); // Llama a la función de registro
});

// Evento para el botón "Confirmar Carga"
document.getElementById('btnSubirImagen').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (file) {
        subirImagen(file)
            .then((downloadURL) => {
                analizarINE(downloadURL);  // Llama a la función analizarINE con la URL de la imagen
            })
            .catch((error) => {
                console.error('Error en el proceso de subida:', error);
            });
    } else {
        alert('Por favor selecciona un archivo.');
    }
});

// Exponer la función al ámbito global
window.mostrarVistaPrevia = mostrarVistaPrevia;
