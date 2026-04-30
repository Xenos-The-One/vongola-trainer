// Vongola Trainer — Flame Confetti Effect
// Triggered at 100% daily completion

export function triggerFlameConfetti() {
  const colors = ['#FF7A45', '#E0A82E', '#FFD700', '#FF4500', '#FFA500'];
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
  document.body.appendChild(container);

  for (let i = 0; i < 40; i++) {
    const particle = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 6 + Math.random() * 8;
    const startX = 20 + Math.random() * 60; // % from left
    const drift = -20 + Math.random() * 40; // px drift
    const duration = 1.5 + Math.random() * 1.5;
    const delay = Math.random() * 0.5;

    particle.style.cssText = `
      position: absolute;
      top: -10px;
      left: ${startX}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      opacity: 1;
      animation: confetti-particle ${duration}s ease-out ${delay}s forwards;
      transform: translateX(${drift}px);
    `;
    container.appendChild(particle);
  }

  // Add keyframe animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes confetti-particle {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(${360 + Math.random() * 360}deg); opacity: 0; }
    }
  `;
  container.appendChild(style);

  // Clean up after animation
  setTimeout(() => {
    container.remove();
  }, 3500);
}
