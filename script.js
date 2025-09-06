// Canvas animation script
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    // Image data
    const images = [];
    const imagePaths = [
        './images/Flag_of_Ukraine.svg.png',
        './images/simmons-university.jpg',
        './images/IMG_2358.JPG'
    ];
    
    // Gyro and shake detection
    let tiltControlEnabled = false;
    let lastShakeTime = 0;
    let gyroData = { x: 0, y: 0 };
    let basePositions = []; // Store original positions for reset
    
    // Background color cycling
    const backgroundColors = [
        '#e0e0e0', // Medium gray
        '#90caf9', // Medium blue
        '#ce93d8', // Medium purple
        '#81c784', // Medium green
        '#ffb74d', // Medium orange
        '#f48fb1', // Medium pink
        '#80cbc4', // Medium teal
        '#c5e1a5', // Medium lime
        '#ffd54f', // Medium yellow
        '#bcaaa4'  // Medium brown
    ];
    let currentColorIndex = 0;
    let isDragging = false;
    let lastDragY = 0;
    let dragSensitivity = 50; // Pixels to drag before color changes
    
    // Set canvas size
    function resizeCanvas() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Ensure canvas fills the viewport properly on mobile Safari
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '1';
        
        // Force canvas to be visible on mobile Safari
        canvas.style.display = 'block';
        canvas.style.visibility = 'visible';
    }
    
    // Mobile Safari detection
    const isMobileSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent);
    
    // Initial resize with mobile Safari fix
    resizeCanvas();
    
    // Additional mobile Safari initialization
    if (isMobileSafari) {
        // Force a re-render after a short delay for mobile Safari
        setTimeout(() => {
            resizeCanvas();
            if (images.length > 0) {
                // Trigger a redraw
                requestAnimationFrame(() => {
                    // Force canvas to be visible
                    canvas.style.display = 'none';
                    canvas.offsetHeight; // Trigger reflow
                    canvas.style.display = 'block';
                });
            }
        }, 100);
    }
    
    // Resize on window resize
    window.addEventListener('resize', function() {
        resizeCanvas();
        // Reposition images to stay within bounds when window resizes
        repositionImages();
    });
    
    // Shake detection
    let lastAcceleration = { x: 0, y: 0, z: 0 };
    let shakeThreshold = 15;
    
    function handleDeviceMotion(event) {
        const acceleration = event.accelerationIncludingGravity;
        const currentTime = Date.now();
        
        // Calculate shake intensity
        const deltaX = Math.abs(acceleration.x - lastAcceleration.x);
        const deltaY = Math.abs(acceleration.y - lastAcceleration.y);
        const deltaZ = Math.abs(acceleration.z - lastAcceleration.z);
        
        const shakeIntensity = deltaX + deltaY + deltaZ;
        
        // Detect shake
        if (shakeIntensity > shakeThreshold && currentTime - lastShakeTime > 1000) {
            lastShakeTime = currentTime;
            toggleTiltControl();
        }
        
        lastAcceleration = { x: acceleration.x, y: acceleration.y, z: acceleration.z };
        
        // Update gyro data for tilt control
        if (tiltControlEnabled) {
            gyroData.x = (acceleration.x || 0) * 0.1; // Scale down the effect
            gyroData.y = (acceleration.y || 0) * 0.1;
        }
    }
    
    // Toggle tilt control on/off
    function toggleTiltControl() {
        tiltControlEnabled = !tiltControlEnabled;
        
        if (tiltControlEnabled) {
            // Store base positions when enabling tilt control
            basePositions = images.map(img => ({
                x: img.x,
                y: img.y,
                baseY: img.baseY
            }));
            console.log('Tilt control enabled! Tilt your phone to move images.');
        } else {
            // Reset to base positions when disabling
            images.forEach((img, index) => {
                if (basePositions[index]) {
                    img.x = basePositions[index].x;
                    img.y = basePositions[index].y;
                    img.baseY = basePositions[index].baseY;
                }
            });
            gyroData = { x: 0, y: 0 };
            console.log('Tilt control disabled. Shake to re-enable.');
        }
    }
    
    // Request device motion permission and add event listener (updated for iOS 17+)
    if (typeof DeviceMotionEvent !== 'undefined') {
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            // iOS 13+ requires permission
            DeviceMotionEvent.requestPermission().then(response => {
                if (response === 'granted') {
                    window.addEventListener('devicemotion', handleDeviceMotion, { passive: true });
                }
            }).catch(() => {
                // Fallback if permission fails
                console.log('Device motion permission denied or not available');
            });
        } else {
            // Android and older iOS
            window.addEventListener('devicemotion', handleDeviceMotion, { passive: true });
        }
    }
    
    // Background color change functions
    function changeBackgroundColor(direction) {
        if (direction > 0) {
            // Drag down - next color
            currentColorIndex = (currentColorIndex + 1) % backgroundColors.length;
        } else {
            // Drag up - previous color
            currentColorIndex = (currentColorIndex - 1 + backgroundColors.length) % backgroundColors.length;
        }
        
        document.body.style.backgroundColor = backgroundColors[currentColorIndex];
    }
    
    // Touch/Mouse drag handlers
    function handleDragStart(e) {
        isDragging = true;
        lastDragY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        e.preventDefault();
    }
    
    function handleDragMove(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        const currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        const deltaY = currentY - lastDragY;
        
        if (Math.abs(deltaY) > dragSensitivity) {
            changeBackgroundColor(deltaY);
            lastDragY = currentY;
        }
    }
    
    function handleDragEnd(e) {
        isDragging = false;
        e.preventDefault();
    }
    
    // Add event listeners for drag functionality
    // Touch events
    document.addEventListener('touchstart', handleDragStart, { passive: false });
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd, { passive: false });
    
    // Mouse events (for desktop testing)
    document.addEventListener('mousedown', handleDragStart);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    
    // Prevent default scrolling
    document.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
    
    // Prevent default scrolling on wheel events
    document.addEventListener('wheel', function(e) {
        e.preventDefault();
        // Use wheel for color change on desktop
        if (e.deltaY > 0) {
            changeBackgroundColor(1); // Scroll down - next color
        } else {
            changeBackgroundColor(-1); // Scroll up - previous color
        }
    }, { passive: false });
    
    // Function to ensure images stay within window bounds
    function repositionImages() {
        const imageSize = 100;
        images.forEach(imgData => {
            // Ensure X position is within bounds
            if (imgData.x < 0) imgData.x = 0;
            if (imgData.x > canvas.width - imageSize) imgData.x = canvas.width - imageSize;
            
            // Ensure Y position is within bounds
            if (imgData.y < 0) imgData.y = 0;
            if (imgData.y > canvas.height - imageSize) imgData.y = canvas.height - imageSize;
            
            // Update baseY for bobbing to stay within bounds
            if (imgData.baseY < imageSize) imgData.baseY = imageSize;
            if (imgData.baseY > canvas.height - imageSize) imgData.baseY = canvas.height - imageSize;
        });
    }
    
    // Load images
    function loadImages() {
        let loadedCount = 0;
        
        imagePaths.forEach((path, index) => {
            const img = new Image();
            img.onload = function() {
                // Store image with position clustered around text container
                const imageSize = 100;
                const textCenterX = canvas.width / 2;
                const textCenterY = canvas.height / 2;
                const clusterRadius = Math.min(200, Math.min(canvas.width, canvas.height) * 0.3); // Responsive radius
                
                // Generate position within cluster radius
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * clusterRadius;
                const x = textCenterX + Math.cos(angle) * distance - imageSize / 2;
                const y = textCenterY + Math.sin(angle) * distance - imageSize / 2;
                
                images.push({
                    image: img,
                    x: Math.max(0, Math.min(x, canvas.width - imageSize)), // Clamp to bounds
                    y: Math.max(0, Math.min(y, canvas.height - imageSize)), // Clamp to bounds
                    width: imageSize, // Fixed size of 100px
                    height: imageSize, // Fixed size of 100px
                    baseY: Math.max(imageSize, Math.min(y, canvas.height - imageSize)), // Base Y position for bobbing
                    tilt: (Math.random() - 0.5) * 0.3, // Slight tilt left or right (in radians)
                    bobSpeed: Math.random() * 0.015 + 0.008, // Random bobbing speed (slower)
                    bobAmplitude: Math.random() * 8 + 4, // Random bobbing amplitude (smaller)
                    time: Math.random() * Math.PI * 2 // Random starting time for bobbing
                });
                loadedCount++;
                
                // Start animation when all images are loaded
                if (loadedCount === imagePaths.length) {
                    animate();
                }
            };
            img.src = path;
        });
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw all images
        images.forEach(imgData => {
            ctx.save();
            
            // Update bobbing time
            imgData.time += imgData.bobSpeed;
            
            // Calculate bobbing Y position
            let bobY = imgData.baseY + Math.sin(imgData.time) * imgData.bobAmplitude;
            
            // Apply gyro-based movement if tilt control is enabled
            if (tiltControlEnabled && basePositions.length > 0) {
                const baseIndex = images.indexOf(imgData);
                if (basePositions[baseIndex]) {
                    // Add gyro offset to base position
                    imgData.x = basePositions[baseIndex].x + gyroData.x * 50; // Scale gyro effect
                    bobY = basePositions[baseIndex].baseY + gyroData.y * 30 + Math.sin(imgData.time) * imgData.bobAmplitude;
                }
            }
            
            imgData.y = bobY;
            
            // Ensure bobbing stays within bounds
            const imageSize = 100;
            if (imgData.y < 0) imgData.y = 0;
            if (imgData.y > canvas.height - imageSize) imgData.y = canvas.height - imageSize;
            
            // Move to image center for tilt
            ctx.translate(imgData.x + imgData.width / 2, imgData.y + imgData.height / 2);
            
            // Apply slight tilt
            ctx.rotate(imgData.tilt);
            
            // Create rounded rectangle clipping path
            const cornerRadius = 15;
            ctx.beginPath();
            ctx.roundRect(
                -imgData.width / 2,
                -imgData.height / 2,
                imgData.width,
                imgData.height,
                cornerRadius
            );
            ctx.clip();
            
            // Draw image centered
            ctx.drawImage(
                imgData.image,
                -imgData.width / 2,
                -imgData.height / 2,
                imgData.width,
                imgData.height
            );
            
            ctx.restore();
        });
        
        requestAnimationFrame(animate);
    }
    
    // Start loading images
    loadImages();
});
