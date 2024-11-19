const archivos = [
    "fragment1.mp4",
    "fragment1_1.png",
    "fragment1_2.png",
    "fragment1_3.png",
    "fragment1_4.png",
    "fragment1_5.png",
    "fragment1_6.png",
    "fragment1_7.png",
    "fragment1_8.png",
    "fragment1_9.png",
    "fragment1_10.png",
    "fragment1_11.png",
    "fragment1_12.png",
    "fragment1_13.png",
    "fragment1_14.png",
    "fragment1_15.png",
    "fragment2.mp4",
    "fragment2_1.png",
    "fragment2_2.png",
    "fragment2_3.png",
    "fragment2_4.png",
    "fragment2_5.png",
    "fragment2_6.png",
    "fragment2_7.png",
    "fragment2_8.png",
    "fragment2_9.png",
    "fragment2_10.png",
    "fragment2_11.png",
    "fragment3.mp4",
    "fragment3_1.png",
    "fragment3_2.png",
    "fragment3_3.png",
    "fragment3_4.png",
    "fragment3_5.png",
    "fragment3_6.png",
    "fragment3_7.png",
    "fragment3_8.png",
    "fragment3_9.png",
    "fragment3_10.png",
    "fragment3_11.png",
    "fragment3_12.png",
    "fragment3_13.png",
    "fragment3_14.png",
    "fragment3_15.png",
];

function recorrerFragmentosYMedia(archivos) {
    const fragmentos = {};

    archivos.forEach(archivo => {
        // Verificar si es una imagen o un video usando expresiones regulares
        const matchImagen = archivo.match(/fragment(\d+)_(\d+)\.png/);
        const matchVideo = archivo.match(/fragment(\d+)\.mp4/);

        if (matchImagen) {
            const fragmento = parseInt(matchImagen[1], 10); // Índice del fragmento
            const imagen = parseInt(matchImagen[2], 10); // Índice de la imagen

            // Asegurarse de que el fragmento existe en el objeto
            if (!fragmentos[fragmento]) {
                fragmentos[fragmento] = { video: null, imagenes: [] };
            }

            // Agregar la imagen al fragmento correspondiente
            fragmentos[fragmento].imagenes.push(imagen);
        }

        if (matchVideo) {
            const fragmento = parseInt(matchVideo[1], 10); // Índice del fragmento

            // Asegurarse de que el fragmento existe en el objeto
            if (!fragmentos[fragmento]) {
                fragmentos[fragmento] = { video: null, imagenes: [] };
            }

            // Asociar el video al fragmento correspondiente
            fragmentos[fragmento].video = archivo;
        }
    });

    let fragments = [];

    // Recorrer los fragmentos y sus medios
    for (const [fragmento, { video, imagenes }] of Object.entries(fragmentos)) {
        fragments[fragmento] = [];
        
        // Mostrar el enlace al video si existe
        if (video) {
            fragments[fragmento].push(`fragment${fragmento}.mp4`);
        }

        // Ordenar e imprimir las imágenes
        imagenes.sort((a, b) => a - b); // Ordenar las imágenes numéricamente
        imagenes.forEach(imagen => {
            fragments[fragmento].push(`fragment${fragmento}_${imagen}.png`);
        });
    }
    
    return fragments;
}


export function getFragmentsAndMedia() {
    return recorrerFragmentosYMedia(archivos);
}
