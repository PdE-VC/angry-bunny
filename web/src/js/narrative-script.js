import { allFragments } from "../content/narrative-data.js";

const urlParams = new URLSearchParams(window.location.search);
let zone = urlParams.get('zone');
if (!zone || (zone != 'Merit' && zone != 'Ritual' && zone != 'Realignment')) {
  zone = 'Purpose';
}

document.addEventListener("DOMContentLoaded", () => {
  const fragmentNames = document.getElementById("fragment-names");
  const fragmentImgs = document.getElementById("fragment-imgs");

  const zoneFragments = allFragments[zone]

  zoneFragments.forEach((fragment) => {
    const fragmentName = document.createElement("div");
    const fragmentVideo = document.createElement("div");

    if (fragment.index =="1") {
      fragmentName.className = "service active";
    } else {
      fragmentName.className = "service";
    }

    fragmentVideo.className = "img";
  
    fragmentName.innerHTML = `
          <p>${fragment.name}</p>
        `;

    fragmentVideo.innerHTML = `
        <video style="width: 100%; height: 100%; object-fit: cover;" controls>
          <source src="./assets/narrative/${fragment.vid}.mp4" type="video/mp4" />
        </video>
        `;

        fragmentVideo.volume = 0.5;
    fragmentVideo.addEventListener('click', () => {
      if (fragmentVideo.requestFullscreen) {
        fragmentVideo.requestFullscreen(); // Para la mayoría de navegadores
      } else if (fragmentVideo.webkitRequestFullscreen) { // Safari
        fragmentVideo.webkitRequestFullscreen();
      } else if (fragmentVideo.msRequestFullscreen) { // Internet Explorer/Edge
        fragmentVideo.msRequestFullscreen();
      }
    });
  
    fragmentNames.appendChild(fragmentName);
    fragmentImgs.appendChild(fragmentVideo);
  });
  
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  const stickySection = document.querySelector(".sticky");
  const stickyHeight = window.innerHeight * 8;
  const services = document.querySelectorAll(".service");
  const indicator = document.querySelector(".indicator");
  const currentCount = document.querySelector("#current-count");
  const serviceImg = document.querySelector(".service-img");
  const serviceCopy = document.querySelector(".service-copy p");
  const serviceHeight = 38;
  const imgHeight = 250;

  document.querySelectorAll('#title').forEach(element => {
    element.innerText = "Angry Bunny | " + zone;
  });

  document.querySelectorAll('.zone').forEach(element => {
    element.innerText = zone;
  });
  
  serviceCopy.textContent = zoneFragments[0].desc;
  let currentSplitText = new SplitType(serviceCopy, { types: "lines" });
  
  const totalCount = document.getElementById("total-count");
  totalCount.innerText = services.length;

  const measureContainer = document.createElement("div");
  measureContainer.style.cssText = `
      position: absolute;
      visibility: hidden;
      height: auto;
      width: auto;
      white-space: nowrap;
      font-family: "PP NeueBit";
      font-size: 60px;
      font-weight: 600;
      text-transform: uppercase;
  `;
  document.body.appendChild(measureContainer);

  const serviceWidths = Array.from(services).map((service) => {
    measureContainer.textContent = service.querySelector("p").textContent;
    return measureContainer.offsetWidth + 8;
  });

  document.body.removeChild(measureContainer);

  

  const scrollPerService = window.innerHeight;
  let currentIndex = 0;

  const animateTextChange = (index) => {
    return new Promise((resolve) => {
      gsap.to(currentSplitText.lines, {
        opacity: 0,
        y: -20,
        duration: 0.25,
        stagger: 0.025,
        ease: "power3.inOut",
        onComplete: () => {
          currentSplitText.revert();

          const newText = zoneFragments[index].desc;
          serviceCopy.textContent = newText;

          currentSplitText = new SplitType(serviceCopy, {
            types: "lines",
          });

          gsap.set(currentSplitText.lines, {
            opacity: 0,
            y: 20,
          });

          gsap.to(currentSplitText.lines, {
            opacity: 1,
            y: 0,
            duration: 0.25,
            stagger: 0.025,
            ease: "power3.out",
            onComplete: resolve,
          });
        },
      });
    });
  };

  ScrollTrigger.create({
    trigger: stickySection,
    start: "top top",
    end: `${stickyHeight}px`,
    pin: true,
    onUpdate: async (self) => {
      const progress = self.progress;
      gsap.set(".progress", { scaleY: progress });

      const scrollPosition = Math.max(0, self.scroll() - window.innerHeight);
      const activeIndex = Math.floor(scrollPosition / scrollPerService);

      if (
        activeIndex >= 0 &&
        activeIndex < services.length &&
        currentIndex !== activeIndex
      ) {
        currentIndex = activeIndex;

        services.forEach((service) => service.classList.remove("active"));
        services[activeIndex].classList.add("active");

        await Promise.all([
          gsap.to(indicator, {
            y: activeIndex * serviceHeight,
            width: serviceWidths[activeIndex],
            duration: 0.3,
            ease: "power3.inOut",
            overwrite: true,
          }),

          gsap.to(serviceImg, {
            y: -(activeIndex * imgHeight),
            duration: 0.3,
            ease: "power3.inOut",
            overwrite: true,
          }),

          gsap.to(currentCount, {
            innerText: activeIndex + 1,
            snap: { innerText: 1 },
            duration: 0.3,
            ease: "power3.out",
          }),

          animateTextChange(activeIndex),
        ]);
      }
    },
  });
});
