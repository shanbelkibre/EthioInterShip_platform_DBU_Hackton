document.addEventListener('DOMContentLoaded', () => {
    const avatars = document.querySelectorAll('.avatar');
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    let radius = Math.min(window.innerWidth, window.innerHeight) * 0.4; // Dynamic radius based on screen size
    const speed = 0.001; // Speed of rotation
    let angle = 0;

    // Position avatars in a circle
    avatars.forEach((avatar, index) => {
        const offsetAngle = (index * 2 * Math.PI) / avatars.length; // Distribute evenly
        avatar.angle = offsetAngle;
    });

    function updatePositions() {
        angle += speed;
        avatars.forEach((avatar) => {
            const x = centerX + radius * Math.cos(avatar.angle + angle) - avatar.offsetWidth / 2;
            const y = centerY + radius * Math.sin(avatar.angle + angle) - avatar.offsetHeight / 2;
            avatar.style.left = `${x}px`;
            avatar.style.top = `${y}px`;
        });
        requestAnimationFrame(updatePositions);
    }

    // Adjust radius on window resize
    window.addEventListener('resize', () => {
        radius = Math.min(window.innerWidth, window.innerHeight) * 0.4;
    });

    updatePositions();
});