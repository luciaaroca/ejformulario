
//-----------CONFIGURACIÓN FIREBASE------------
const firebaseConfig = {
    apiKey: "AIzaSyBTLcUzPjMWysHsfBc_X6dyp3aI58zjcMw",
    authDomain: "fir-web-37d16.firebaseapp.com",
    projectId: "fir-web-37d16",
    storageBucket: "fir-web-37d16.firebasestorage.app",
    messagingSenderId: "329997623369",
    appId: "1:329997623369:web:ac01341aee00c2ab7e5f98"
  }; //datos de conexión -> nuestro objeto de conexión

firebase.initializeApp(firebaseConfig);// Inicializaar app Firebase

const db = firebase.firestore();//(db) objeto que representa mi base de datos - BBDD //inicia Firestore
//----------------------------------------




////***********local storage************/

const limpiarBtn = document.getElementById("limpiar");
const campos = ["email", "name", "message", "url"];
   /*const formulario = document.getElementById("formulario");------->lo hemos puesto abajo*/

campos.forEach(campo => { //
  const input = document.getElementById(campo);
  input.addEventListener("change", guardarFormulario);
});   

function guardarFormulario() {
  const formData = {};
  campos.forEach(campo => formData[campo] = document.getElementById(campo).value);
  localStorage.setItem("form_data", JSON.stringify(formData));
}
//***********************/




//-------------validar campos del formulario---------------
const formulario = document.getElementById("formulario");

formulario.addEventListener("submit", function(event){ 
  event.preventDefault();

      const email = document.getElementById("email").value.trim();
      const name = document.getElementById("name").value.trim();
      const message = document.getElementById("message").value.trim();
      const url = document.getElementById("url").value.trim();

      //validaciones
      if (!name || !email || !message || !url) {
        alert("Completa todos los campos.");
        return;
      }
      const regexMessage = /^.{0,50}$/;
      if(!regexMessage.test(message)){
        /*alert ("Error: el texto tiene que tener menos de 50 caracteres");
        return*/
        Swal.fire({
        icon: "error",
        title: "Tu mensaje es demasiado largo",
        text: "Escribe un mensaje con menos de 50 caracteres",
      });
      }

      //***********local storage************/
      let registros = JSON.parse(localStorage.getItem("registros")) || []; //convertimos a objetos y realizamos la descarga
      registros.push({ email, name, message, url });
      localStorage.setItem("registros", JSON.stringify(registros)); //tenemos que volver a convertir tdo a string
      //***********************/

      
      cargarFormulario()

      formulario.reset()

      createPerson({
            name: name,
            email: email,
            message: message,
            url: url
        }); //creamos el objeto que queremos guardar en la colección
      
      
})//cerramos el addeventlistener
//----------------------------------------




//***********local storage************/
function cargarFormulario() {
  const data = JSON.parse(localStorage.getItem("form_data")); //gracias al getItem (guarda los datos)
  if (data) {
    campos.forEach(campo => {
      const input = document.getElementById(campo);
      input.value = data[campo ] || ""; //si no pones los datos se queda vacío
    });
  }
}
//***********************/






//------------BTN LIMPIAR FORM-------------------------
//función limpiar
function limpiarFormulario(){
  formulario.reset();
  localStorage.removeItem("form_data");
}
//llamamos a la función al hacer click
limpiarBtn.addEventListener("click",()=>{
  limpiarFormulario();
})
//-----------------------------





//-------------Guardar datos en firebase (crear un objeto para la colección)---------------

const createPerson = (person) => {//persona será un objeto con los datos que queremos guardar
  db.collection("personas") //creamos la colección
    .add(person)//agregamos un nuevo objeto con los datos de card
    .then((docRef) => {//docRef es la referencia del objeto recien creado
      console.log("Document written with ID: ", docRef.id)//id unico generado
      readAll(); //es como hacer un refresco
    })
    .catch((error) => console.error("Error adding document: ", error));
};
//----------------------------------------






//-------------MOSTRAR DATOS EN EL DOM ---------------

//LEEMOS DATOS DE LOS OBJETOS
const readAll = ()=> {//objetivo de la función: es leer todos los objetos de la colección personas y mostrarlos en la página.
  cleanPerson();//elimina los elementos actuales del album en la página (paara que no se repitan cada vez que demos a enviar)

   db.collection("personas")//accede a la colección personas
     .get()//petición a Firestore para traer todos los documentos de la colección--->crea una promesa
     .then((resulGet)=>{//se ejecuta cuando firestore devuelve los objetos (es un then porque tiene que esperar la respuesta de get)
        resulGet.forEach((doc) =>{ //para cada resultado
            const data = doc.data(); // doc.data()->devuelve un objeto con las propiedades que guardaste en Firestore--->data.(son los campos del doc (los datos del formulario))
            printPerson(data.name, data.email, data.message, data.url,); //hay que pasarle los argumentos /doc.(el id no esta en la data sino en el propio documento/objeto)
        })
     })
     .catch(()=> console.log(`Error reding document`))
}//cerramos función readAll

//CLEAN DOM (la hemos usado en readAll)
const cleanPerson = () => {
  document.getElementById("personas").innerHTML = "";
};

//PINTAR TARJETAS DE PERSONAS
const printPerson = (name, email, message, url, /*docId*/) =>{
    let card = document.createElement('article');
    card.setAttribute ('class', 'card');

    let foto = document.createElement('img');
    foto.setAttribute('src', url);
    
    let nombre = document.createElement('h2');
    nombre.innerHTML= name

    let mail = document.createElement('p');
    mail.innerHTML= email

    let mensaje = document.createElement('p');
    mensaje.innerHTML=message;

    

    /*let id = document.createElement("p");
    id.innerText= "ID:" + docId;*/

    card.appendChild(foto);
    card.appendChild(nombre);
    card.appendChild(mail);
    card.appendChild(mensaje);
    /*card.appendChild(id)*/

    const personas =document.getElementById("personas");
    personas.appendChild(card);
};
//----------------------------------------




//--------------BORRAR UNA PERSONA----------
const deletePerson = () => {

   const nombreBorrar = prompt("Introduce un nombre de la persona que deseas eliminar:");
   if(!nombreBorrar) return; //si no se completa---> se deja vacío

   db.collection("personas")
   .where("name","==",nombreBorrar)//defino que buscar
   .get()//ejecuta la consulta
   .then((resultGet)=>{
    if(resultGet.empty){
     alert(`No se encontro ninguna persona con el nombre ${nombreBorrar}`)
     return
    }
    if (!confirm(`Se van a borrar ${resultGet.size} persona(s) llamada(s) "${nombreBorrar}". ¿Deseas continuar?`)) {
        return;
      }
    resultGet.forEach((doc)=>{
       db.collection("personas").doc(doc.id).delete();
    })
    alert(`Se ha borrado correctamente la(s) persona(s) llamada(s): ${nombreBorrar}`);
    document.getElementById("personas").innerHTML = "";
    readAll();
  
   })
   .catch((error) => console.log("Error al borrar la persona deseada:", error));

}//cerramos funcion delete



document.getElementById("borrar1").addEventListener("click", ()=>{
   deletePerson();
})//al hacer click en el botón borrar hace deletePersona
//----------------------------------------





//--------------BORRAR TODAS----------

const deleteAll = () =>{
  
  if(!confirm("Seguro que deseas borrar todas las personas?")) 
  return; //si no se completa---> se deja vacío

  db.collection("personas")
  .get()
  .then((resultGet)=>{
    if(resultGet.empty){
     alert("No hay personas")
     return
    }

  
    resultGet.forEach((doc)=>{
       db.collection("personas").doc(doc.id).delete();//elimina de firebase
    })

    alert(`Se han borrado ${resultGet.size}`);
    document.getElementById("personas").innerHTML = ""; //elimina del dom ""
    readAll();
  })
   .catch((error) => console.log("Error al borrar a las personas", error));

}//cerramos deleteAll


document.getElementById("borrar").addEventListener("click", ()=>{
   deleteAll ();
})//al hacer click en el botón borrar hace deleteAll

//----------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    readAll();
    cargarFormulario(); // lee todas las personas y las pinta al cargar la página
});//fin de pintar persona






// //--------------EDITAR----------

// const editPerson = async () => {
//     const nombreEditar = prompt("Introduce el nombre de la persona que quieres editar:");
//     if (!nombreEditar) return; // si el usuario cancela o deja vacío

//     // Buscar documentos con ese nombre
//     const resultGet = await db.collection("personas")
//                               .where("name", "==", nombreEditar)
//                               .get();

//     if (resultGet.empty) {
//         alert(`No se encontró ninguna persona con el nombre "${nombreEditar}"`);
//         return;
//     }

//     // Si hay varias personas con el mismo nombre, tomamos la primera
//     const doc = resultGet.docs[0];
//     const data = doc.data();
//     const docId = doc.id;

//     // Seleccionamos la tarjeta correspondiente en el DOM
//     const tarjeta = document.getElementById(docId);

//     // Crear un formulario debajo de la tarjeta
//     let form = document.createElement("form");
//     form.innerHTML = `
//         <input type="text" id="editName" value="${data.name}" placeholder="Nombre">
//         <input type="email" id="editEmail" value="${data.email}" placeholder="Email">
//         <input type="text" id="editMessage" value="${data.message}" placeholder="Mensaje">
//         <input type="text" id="editUrl" value="${data.url}" placeholder="URL de la foto">
//         <button type="submit">Guardar</button>
//     `;
    

   

//     card.appendChild(form);

//     // Evento submit para actualizar los datos
//     form.addEventListener("submit", async (e) => {
//         e.preventDefault();

//         await db.collection("personas").doc(docId).update({
//             name: form.editName.value,
//             email: form.editEmail.value,
//             message: form.editMessage.value,
//             url: form.editUrl.value
//         });

//         // Actualizar la tarjeta en el DOM
//         tarjeta.querySelector("h2").textContent = form.editName.value;
//         tarjeta.querySelectorAll("p")[0].textContent = form.editEmail.value;
//         tarjeta.querySelectorAll("p")[1].textContent = form.editMessage.value;
//         tarjeta.querySelector("img").src = form.editUrl.value;

//         // Eliminar el formulario después de guardar
//         form.remove();
//     });
// };






// document.getElementById("editar").addEventListener("click", ()=>{
//    editPerson();
// })//al hacer click en el botón borrar hace deletePersona













