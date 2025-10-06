'use client'

import { useEffect } from 'react'

export function ClientAnimations() {
  useEffect(() => {
    // Initialize particles
    function createParticles() {
      const container = document.getElementById('particles');
      if (!container) return;
      
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = particle.style.height = Math.random() * 4 + 2 + 'px';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
        container.appendChild(particle);
      }
    }

    // Initialize fade-in animations
    function initFadeInAnimations() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
      });
    }

    // Add parallax effect to floating elements
    function handleScroll() {
      const scrolled = window.pageYOffset;
      const parallax = document.querySelectorAll('.floating-animation');
      
      parallax.forEach(element => {
        const speed = 0.5;
        (element as HTMLElement).style.transform = `translateY(${scrolled * speed}px)`;
      });
    }

    // Initialize everything
    createParticles();
    initFadeInAnimations();
    
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return null;
}