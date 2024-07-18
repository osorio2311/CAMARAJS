let videoElement=document.querySelector("#camara");
let botonTomarFoto=document.querySelector("#tomar-foto");
let botonBorrarTodo=document.querySelector("#borrar-todo");
let galeriaDeFotos=document.querySelector("#galeria");

//Solicitar acceso a la cámara
navigator.mediaDevices.getUserMedia({video:true}).then(stream=>{videoElement.srcObject=stream})
.catch(error=>{
    alert("Error al acceder a la cámara"+error);
})

//declaración del contador de fotos para generar el id y poder borrar o descargar
let contadorIDfotos=getNextPhoto();


//Cuando se pulsa click en tomar foto, se genera un canvas de tipo 2d, con las coordenadas x,y de la imagen que se está transmitiendo de la cámara.
botonTomarFoto.addEventListener("click",()=>{
    let canvas=document.createElement("canvas");
    canvas.width=videoElement.videoWidth;
    canvas.height=videoElement.videoHeight;
    const contex=canvas.getContext("2d");
    //dibuja con todos los datos anteriores
    contex.drawImage(videoElement,0,0,canvas.width,canvas.height);

    // galeriaDeFotos.appendChild(canvas); ->solo de prueba

    //convertir el canvas a base64
    let dataUrl=canvas.toDataURL("image/jpeg",0.9);//le indicamos que convierta el canvas a una imagen jpeg con la ruta que vamos a establecer con el id
    let photoID=contadorIDfotos++;
    guardarFoto({id:photoID, dataUrl});//clave:valor mapa con el id y la ruta, para guardarlo en el localStorage del navegador.
    setNextPhoto(contadorIDfotos);//se pasa el valor del contador de foto a una función que prepara para la próxima foto el contador.
});

function guardarFoto(photo, isPhotoLoad=false){
    //crear el contenedor para la foto
    let photoContainer=document.createElement("div");
    photoContainer.className="photo-container";
    photoContainer.dataset.id=photo.id; 


    //crear la imagen
    let img=new Image();//esta variable es de tipo objeto de imagen
    img.src=photo.dataUrl;
    img.className="photo";

    //crear el contenedor para los botones
    let contenedorBotones=document.createElement("div");
    contenedorBotones.className="botones-photo";
    
    //crear el botón de eliminar
    eliminarPhoto=document.createElement("button");
    eliminarPhoto.className="boton-eliminar";
    eliminarPhoto.textContent="Eliminar";
    //crear el evento si pulsan click en este botón
    eliminarPhoto.addEventListener("click", ()=>{
        eliminar(photo.id);

    })

    //crear el botón de descargar
    let descargarPhoto=document.createElement("button");
    descargarPhoto.className="boton-descargar";
    descargarPhoto.textContent="Descargar";
    descargarPhoto.addEventListener("click", ()=>{
        descargar(photo.dataUrl,`photo-${photo.id}.jpeg`);
    })

    galeriaDeFotos.appendChild(photoContainer);
    photoContainer.appendChild(img);
    photoContainer.appendChild(contenedorBotones);
    contenedorBotones.appendChild(eliminarPhoto);
    contenedorBotones.appendChild(descargarPhoto);

    //guardar la imagen en el almacenamiento local solo si no está cargado desde localStorage
if (!isPhotoLoad){
    let fotos=JSON.parse(localStorage.getItem("fotos")) || [];
    fotos.push(photo);
    localStorage.setItem("fotos",JSON.stringify(fotos));
}}




function eliminar(id){
//primero lo elimina de la vista
    let divEliminar=document.querySelector(`.photo-container[data-id="${id}"]`);
    if (divEliminar){
        galeriaDeFotos.removeChild(divEliminar);
    }

    //eliminar del localStorage, se leen todas las fotos que están guardadas y se filtra, el que sea al id que se busca, 
    let fotos = JSON.parse(localStorage.getItem("fotos")) || [];//-> ||[]si en fotos no existe nada o es nulo devuelve un array vacio;
    fotos = fotos.filter(photo => photo.id !== id);
    localStorage.setItem("fotos", JSON.stringify(fotos));

}
function descargar(dataUrl,filename){
    let elemento=document.createElement("a"); //enlace tipo file
    elemento.href=dataUrl;
    elemento.download=filename;
    document.body.appendChild(elemento);
    elemento.click();
    document.body.removeChild(elemento);
}




function getNextPhoto(){
    return parseInt(localStorage.getItem("contadorIDfotos")) || 0;
}

function setNextPhoto(id){
    localStorage.setItem("contadorIDfotos",id.toString());
}

botonBorrarTodo.addEventListener("click", ()=>{
    localStorage.removeItem("fotos");
    while(galeriaDeFotos.firstChild){
        galeriaDeFotos.removeChild(galeriaDeFotos.firstChild);
    }
    //inicializamos el contador 
    contadorIDfotos=0;
    //inicializamos el localStorage
    setNextPhoto(contadorIDfotos);
})



//cuando carga la página debe recuperar todas las fotos-....
//Lee el localStorage y muestra las fotos que esten almacenadas
let fotosGuardadas=JSON.parse(localStorage.getItem("fotos")) || [];
fotosGuardadas.forEach(element => {
    guardarFoto(element, true); //el true hace referencia que si es leido, o tiene contenido
});





