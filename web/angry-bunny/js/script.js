import { getFragmentsAndMedia } from "../content/data.js";

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);
  // Initialize scroll handler
  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 750);
  });
  gsap.ticker.lagSmoothing(0);

  // Helper functions
  function splitTextIntoSpans(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      const [firstDigit, secondDigit] = element.innerText;
      element.innerHTML = `
    <div class="digit-wrapper">
      <span class="first">${firstDigit}</span><span class="second">${secondDigit}</span>
    </div>
  `;
    });
  }

  function initializePreview() {
    // Muestra el video inicial sin reproducirlo
    videoContainer.style.display = "block";
    previewVideo.style.display = "block";
    previewVideo.pause(); // Asegurarte de que no esté reproduciéndose
    previewVideo.src = "./assets/fragment1.mp4"; // Ruta del video inicial (ajusta según tu archivo)
  }

  const imagesPerProject = 6;
  var fragmentIndex = 1;
  const fragmentMedia = getFragmentsAndMedia();

fragmentMedia.forEach((fragments) => {
  let variationIndex = 0;
  //const projectNames = document.querySelector(".project-names");

  // Crear nombre para el fragmento
  const name = document.createElement("div");
  name.classList.add("name");
  if (fragmentIndex === 1) {
    name.classList.add("active");
  }

  const p = document.createElement("p");
  p.innerText = `Fragment ${fragmentIndex}`;
  name.appendChild(p);
  //projectNames.appendChild(name);

  // Calcular el número de proyectos necesarios para este fragmento
  const numberProjectsForFragment = Math.ceil(fragments.length / imagesPerProject);

  for (let i = 0; i < numberProjectsForFragment; i++) {
    const gallery = document.querySelector(".gallery");

    // Crear contenedor para el proyecto
    const project = document.createElement("div");
    project.classList.add("project");

    // Crear índice del proyecto
    const index = document.createElement("div");
    index.classList.add("index");

    const mask = document.createElement("div");
    mask.classList.add("mask");

    let fragmentIndexStr = fragmentIndex;
    if (fragmentIndex < 10) {
      fragmentIndexStr = "0" + fragmentIndex;
    }
    mask.innerHTML = `<h1>${fragmentIndexStr}</h1>`;

    // Crear contenedor para las imágenes
    const images = document.createElement("div");
    images.classList.add("images");

    // Agregar video al comienzo del primer proyecto del fragmento
    if (i === 0 && fragments[0].endsWith(".mp4")) {
      const videoContainer = document.createElement("div");
      videoContainer.classList.add("video");

      const video = document.createElement("video");
      video.src = `./assets/${fragments[0]}`; // Ruta del video
      video.muted = false; // Silenciar video
      video.style = "display: block;"; // Ocultar video
      video.loop = true; // Reproducir en bucle

      videoContainer.appendChild(video);

      // Eventos para reproducir/detener el video en hover
      videoContainer.addEventListener("mouseenter", () => {
        video.play();
      });

      videoContainer.addEventListener("mouseleave", () => {
        video.pause();
      });

      images.appendChild(videoContainer); // Añadir el video al proyecto
    }

    // Calcular las imágenes que corresponden a este proyecto
    const start = i * imagesPerProject + (i === 0 && fragments[0].endsWith(".mp4") ? 1 : 0);
    const end = Math.min(start + imagesPerProject, fragments.length);

    for (let j = start; j < end; j++) {
      if (fragments[j].endsWith(".png") || fragments[j].endsWith(".jpg")) {
        const imgContainer = document.createElement("div");
        imgContainer.classList.add("img");

        const img = document.createElement("img");
        img.src = `./assets/${fragments[j]}`; // Ruta de la imagen
        img.alt = `Fragment ${fragmentIndex} Image ${j - start + 1}`;
        imgContainer.appendChild(img);

        images.appendChild(imgContainer);
      }
    }

    // Añadir máscara, índice e imágenes al proyecto
    index.appendChild(mask);
    project.appendChild(index);
    project.appendChild(images);

    // Añadir proyecto a la galería
    gallery.appendChild(project);
  }

  fragmentIndex++; // Incrementar el índice del fragmento
});

  // Split text and populate gallery
  splitTextIntoSpans(".mask h1");
  let imageIndex = 1;
  //populateGallery();

  // Progress bar
  ScrollTrigger.create({
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      gsap.set(".progress-bar", { scaleY: self.progress });
    },
  });

  const previewImg = document.querySelector(".preview-img img");
  const videoContainer = document.querySelector(".video-container");
  const previewVideo = document.querySelector(".preview-video");
  previewVideo.muted = true; // Silenciar video
  previewVideo.autoplay = false; // Desactivar reproducción automática
  previewVideo.style.display = "block"; // Asegurarte de que el video esté visible
  previewVideo.src = "./assets/fragment1.mp4"; // Establecer el video inicial (ajusta la ruta si es necesario)
  const imgElements = document.querySelectorAll(".img img, .video video");

  initializePreview();
  
  // Actualizar el contenedor de vista previa para alternar entre imágenes y videos
  imgElements.forEach((element) => {
    ScrollTrigger.create({
      trigger: element,
      start: "top 50%",
      end: "bottom 50%",
      onEnter: () => {
        if (element.tagName.toLowerCase() === "video") {
          previewImg.style.display = "none"; // Oculta la imagen
          videoContainer.style.display = "block"; // Muestra el video y los controles
          previewVideo.src = element.src; // Actualiza la fuente del video
          previewVideo.volume = 1.0; // Habilita el audio
          previewVideo.play();
        } else {
          videoContainer.style.display = "none"; // Oculta el video y los controles
          previewVideo.pause();
          previewImg.style.display = "block"; // Muestra la imagen
          previewImg.src = element.src; // Actualiza la fuente de la imagen
        }
      },
      onEnterBack: () => {
        if (element.tagName.toLowerCase() === "video") {
          previewImg.style.display = "none";
          videoContainer.style.display = "block";
          previewVideo.src = element.src;
          previewVideo.play();
        } else {
          videoContainer.style.display = "none";
          previewVideo.pause();
          previewImg.style.display = "block";
          previewImg.src = element.src;
        }
      },
      onLeave: () => {
        if (element.tagName.toLowerCase() === "video") {
          previewVideo.pause();
        }
      },
      onLeaveBack: () => {
        if (element.tagName.toLowerCase() === "video") {
          previewVideo.pause();
        }
      },
    });
  });

  // Indicator movement and project name activation
  const indicator = document.querySelector(".indicator");
  const indicatorStep = 18;
  const names = gsap.utils.toArray(".name");
  gsap.set(".indicator", { top: "0px" });
  
  const projects = gsap.utils.toArray(".project");
  projects.forEach((project, index) => {
    ScrollTrigger.create({
      trigger: project,
      start: "top 50%",
      end: "bottom 50%",
      onEnter: () => {
        gsap.to(indicator, {
          top: Math.max(0, index * indicatorStep) + "px",
          duration: 0.3,
          ease: "power2.out",
        });
  
        names.forEach((name, i) =>
          name.classList.toggle("active", i === index)
        );
      },
      onLeaveBack: () => {
        const targetPosition = index - 1 < 0 ? 0 : (index - 1) * indicatorStep;
        gsap.to(indicator, {
          top: targetPosition + "px",
          duration: 0.3,
          ease: "power2.out",
        });
  
        names.forEach((name, i) =>
          name.classList.toggle("active", i === (index - 1 < 0 ? 0 : index - 1))
        );
      },
    });
  });

  // Mask animation
  projects.forEach((project, i) => {
    const mask = project.querySelector(".mask");
    const digitWrapper = project.querySelector(".digit-wrapper");
    const firstDigit = project.querySelector(".first");
    const secondDigit = project.querySelector(".second");

    gsap.set([mask, digitWrapper, firstDigit, secondDigit], { y: 0 });
    gsap.set(mask, { position: "absolute", top: 0 });

    ScrollTrigger.create({
      trigger: project,
      start: "top bottom",
      end: "bottom top",
      anticipatePin: 1,
      fastScrollEnd: true,
      preventOverlaps: true,
      onUpdate: (self) => {
        const projectRect = project.getBoundingClientRect();
        const windowCenter = window.innerHeight / 2;
        const nextProject = projects[i + 1];
        const velocityAdjustment = Math.min(scrollVelocity * 0.1, 100);
        const pushPoint =
          window.innerHeight * (0.85 + velocityAdjustment / window.innerHeight);

        if (projectRect.top <= windowCenter) {
          if (!mask.isFixed) {
            mask.isFixed = true;
            gsap.set(mask, { position: "fixed", top: "50vh" });
          }

          if (nextProject) {
            const nextRect = nextProject.getBoundingClientRect();

            if (nextRect.top <= pushPoint && activeIndex !== i + 1) {
              gsap.killTweensOf([mask, digitWrapper, firstDigit, secondDigit]);

              activeIndex = i + 1;
              gsap.to(mask, {
                y: -80,
                duration: 0.3,
                ease: "power2.out",
                overwrite: true,
              });
              gsap.to(digitWrapper, {
                y: -80,
                duration: 0.5,
                delay: 0.5,
                ease: "power2.out",
                overwrite: true,
              });
              gsap.to(firstDigit, {
                y: -80,
                duration: 0.75,
                ease: "power2.out",
                overwrite: true,
              });
              gsap.to(secondDigit, {
                y: -80,
                duration: 0.75,
                delay: 0.1,
                ease: "power2.out",
                overwrite: true,
              });
            }
          }
        } else {
          mask.isFixed = false;
          gsap.set(mask, { position: "absolute", top: 0 });
        }

        if (self.direction === -1 && projectRect.top > windowCenter) {
          mask.isFixed = false;
          gsap.set(mask, { position: "absolute", top: 0 });

          if (i > 0 && activeIndex === i) {
            const prevProject = projects[i - 1];
            if (prevProject) {
              const prevMask = prevProject.querySelector(".mask");
              const prevWrapper = prevProject.querySelector(".digit-wrapper");
              const prevFirst = prevProject.querySelector(".first");
              const prevSecond = prevProject.querySelector(".second");

              gsap.killTweensOf([prevMask, prevWrapper, prevFirst, prevSecond]);

              activeIndex = i - 1;
              gsap.to([prevMask, prevWrapper], {
                y: 0,
                duration: 0.3,
                ease: "power2.out",
                overwrite: true,
              });
              gsap.to(prevFirst, {
                y: 0,
                duration: 0.75,
                ease: "power2.out",
                overwrite: true,
              });
              gsap.to(prevSecond, {
                y: 0,
                duration: 0.75,
                delay: 0.1,
                ease: "power2.out",
                overwrite: true,
              });
            }
          }
        }
      },
      onEnter: () => {
        if (i === 0) activeIndex = 0;
      },
    });
  });

  // Track scroll velocity
  let activeIndex = -1;
  let lastScrollTop = 0;
  let scrollVelocity = 0;

  window.addEventListener(
    "scroll",
    () => {
      const st = window.pageYOffset;
      scrollVelocity = Math.abs(st - lastScrollTop);
      lastScrollTop = st;
    },
    { passive: true }
  );
});
