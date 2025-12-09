document.addEventListener("DOMContentLoaded", () => {

    // ========== PRELOADER CODE (ADD THIS FIRST) ==========
    
    const splitTextIntoLines = (selector) => {
        const elements = document.querySelectorAll(selector);
        
        elements.forEach(element => {
            const originalHTML = element.innerHTML;
            const paragraphs = originalHTML.split('<br>');
            element.innerHTML = '';
            
            paragraphs.forEach((text, index) => {
                const lineWrapper = document.createElement('div');
                lineWrapper.className = 'line-wrapper';
                lineWrapper.style.overflow = 'hidden';
                lineWrapper.style.display = 'block';
                
                const line = document.createElement('div');
                line.className = 'line';
                line.innerHTML = text.trim();
                line.style.display = 'block';
                line.style.transform = 'translateY(100%)';
                line.style.willChange = 'transform';
                
                lineWrapper.appendChild(line);
                element.appendChild(lineWrapper);
                
                if (index < paragraphs.length - 1) {
                    const spacer = document.createElement('div');
                    spacer.style.height = '0';
                    element.appendChild(spacer);
                }
            });
        });
    };

    splitTextIntoLines(".preloader-copy p");
    splitTextIntoLines(".preloader-counter p");

    const animateCounter = (selector, duration = 5, delay = 0) => {
        const counterElement = document.querySelector(selector);
        if (!counterElement) return;
        
        let currentValue = 0;
        const updateInterval = 200;
        const maxDuration = duration * 1000;
        const startTime = Date.now();

        setTimeout(() => {
            const updateCounter = () => {
                const elapsedTime = Date.now() - startTime;
                const progress = elapsedTime / maxDuration;

                if (currentValue < 100 && elapsedTime < maxDuration) {
                    const target = Math.floor(progress * 100);
                    const jump = Math.floor(Math.random() * 25) + 5;
                    currentValue = Math.min(currentValue + jump, target, 100);

                    const lineElement = counterElement.querySelector('.line');
                    if (lineElement) {
                        lineElement.textContent = currentValue.toString().padStart(2, "0");
                    }
                    
                    setTimeout(updateCounter, updateInterval + Math.random() * 100);
                } else {
                    const lineElement = counterElement.querySelector('.line');
                    if (lineElement) {
                        lineElement.textContent = "100";
                    }
                }
            };

            updateCounter();
        }, delay * 1000);
    };
    
    animateCounter(".preloader-counter p", 4.5, 2);

    // Preloader timeline
    const preloaderTl = gsap.timeline({
        onComplete: () => {
            // Initialize scroll animations after preloader
            initializeScrollAnimations();
        }
    });

    preloaderTl.to([".preloader-copy p .line", ".preloader-counter p .line"], {
        y: "0%",
        duration: 1,
        stagger: 0.075,
        ease: "power3.out",
        delay: 1,
    })
    .to(
        ".preloader-revealer", 
        {
            scale: 0.1,
            duration: 0.75,
            ease: "power2.out",
        },
        "<"
    )
    .to(".preloader-revealer", {
        scale: 0.25,
        duration: 1,
        ease: "power3.out"
    })
    .to(".preloader-revealer", {
        scale: 0.5,
        duration: 0.75,
        ease: "power3.out"
    })
    .to(".preloader-revealer", {
        scale: 0.75,
        duration: 0.5,
        ease: "power2.out"
    })
    .to(".preloader-revealer", {
        scale: 1,
        duration: 1,
        ease: "power3.out"
    })
    .to(".preloader", {
        clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
        duration: 1.25,
        ease: "power3.out",
    }, "-=1");

    // ========== YOUR ORIGINAL SCROLL ANIMATIONS (WRAPPED IN FUNCTION) ==========
    
    function initializeScrollAnimations() {
        gsap.registerPlugin(ScrollTrigger);

        const lenis = new Lenis();
        lenis.on("scroll", ScrollTrigger.update);
        
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);

        const animeTextParagraphs = document.querySelectorAll(".anime-text p");
        const wordHighlightBgColor = "60, 60, 60";
        const keywords = [
            "moments",
            "experience",
            "fragments",
            "pieces",
            "stitched",
            "archive",
            "preserving",
            "digital",
            "album",
        ];

        animeTextParagraphs.forEach((paragraph) => {
            const text = paragraph.textContent;
            const words = text.split(/\s+/);
            paragraph.innerHTML = "";
            
            words.forEach((word) => { 
                if (word.trim()) {
                    const wordContainer = document.createElement("div");
                    wordContainer.className = "word";

                    const wordText = document.createElement("span");
                    wordText.textContent = word;

                    const normalizedWord = word.toLowerCase().replace(/[.,!?;:"]/g, "");
                    if (keywords.includes(normalizedWord)) { 
                        wordContainer.classList.add("keyword-wrapper");
                        wordText.classList.add("keyword", normalizedWord);
                    }

                    wordContainer.appendChild(wordText);
                    paragraph.appendChild(wordContainer);
                }
            });
        });

        const animeTextContainers = document.querySelectorAll(".anime-text-container"); 

        animeTextContainers.forEach((container) => {
            ScrollTrigger.create({ 
                trigger: container,
                pin: container,
                start: "top top",
                end: `+=${window.innerHeight * 4}`,
                pinSpacing: true,
                onUpdate: (self) => {
                    const progress = self.progress;
                    const words = Array.from(
                        container.querySelectorAll(".anime-text .word")
                    );
                    const totalWords = words.length;

                    words.forEach((word, index) => {
                        if (progress <= 0.7) {
                            const progressTarget = 0.7;
                            const revealProgress = Math.min(1, progress / progressTarget);

                            const overlapWords = 15;
                            const totalAnimationLength = 1 + overlapWords / totalWords;

                            const wordStart = index / totalWords;
                            const wordEnd = wordStart + overlapWords / totalWords;

                            const timelineScale =
                            1 / 
                            Math.min(
                                totalAnimationLength,
                                1 + (totalWords - 1)/ totalWords + overlapWords / totalWords
                            );

                            const adjustedStart = wordStart * timelineScale;
                            const adjustedEnd = wordEnd * timelineScale;
                            const duration = adjustedEnd - adjustedStart;

                            const wordProgress = 
                            revealProgress <= adjustedStart
                            ? 0
                            : revealProgress >= adjustedEnd
                            ? 1
                            : (revealProgress - adjustedStart) / duration;

                            word.style.opacity = wordProgress;

                            const backgroundFadeStart = 
                            wordProgress >= 0.9 ? (wordProgress - 0.9) / 0.1 : 0;
                            const backgroundOpacity = Math.max(0, 1 - backgroundFadeStart);
                            word.style.backgroundColor = `rgba(${wordHighlightBgColor}, ${backgroundOpacity})`;
                        } else {
                            word.style.opacity = 1;
                            word.style.backgroundColor = 'transparent';
                        }
                    });
                }
            });
        });
    }
});
