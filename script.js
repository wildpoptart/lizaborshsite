// Canvas animation script
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    // Enable high-quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Image data
    const images = [];
    const imagePaths = [
        './images/Flag_of_Ukraine.svg.png',
        './images/simmons-university.jpg',
        './images/IMG_2358.JPG'
    ];
    
    
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
    
    // Image dragging
    let draggedImage = null;
    let dragOffset = { x: 0, y: 0 };
    let imageVelocities = []; // Store velocities for bouncing
    
    // Set canvas size
    function resizeCanvas() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Enable image smoothing for crisp images
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
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
    
    // Image drag detection
    function getImageAtPoint(x, y) {
        for (let i = images.length - 1; i >= 0; i--) {
            const img = images[i];
            if (x >= img.x && x <= img.x + img.width &&
                y >= img.y && y <= img.y + img.height) {
                return img;
            }
        }
        return null;
    }
    
    // Mouse/Touch event handlers for image dragging
    let lastDragPosition = { x: 0, y: 0 };
    let dragStartTime = 0;
    
    function handleImageDragStart(e) {
        const rect = canvas.getBoundingClientRect();
        const x = (e.type === 'touchstart' ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.type === 'touchstart' ? e.touches[0].clientY : e.clientY) - rect.top;
        
        const clickedImage = getImageAtPoint(x, y);
        if (clickedImage) {
            draggedImage = clickedImage;
            draggedImage.isDragged = true;
            dragOffset.x = x - draggedImage.x;
            dragOffset.y = y - draggedImage.y;
            lastDragPosition = { x: x, y: y };
            dragStartTime = Date.now();
            e.preventDefault();
        }
    }
    
    function handleImageDragMove(e) {
        if (draggedImage) {
            const rect = canvas.getBoundingClientRect();
            const x = (e.type === 'touchmove' ? e.touches[0].clientX : e.clientX) - rect.left;
            const y = (e.type === 'touchmove' ? e.touches[0].clientY : e.clientY) - rect.top;
            
            draggedImage.x = x - dragOffset.x;
            draggedImage.y = y - dragOffset.y;
            
            // Update last position for momentum calculation
            lastDragPosition = { x: x, y: y };
            e.preventDefault();
        }
    }
    
    function handleImageDragEnd(e) {
        if (draggedImage) {
            const rect = canvas.getBoundingClientRect();
            const x = (e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX) - rect.left;
            const y = (e.type === 'touchend' ? e.changedTouches[0].clientY : e.clientY) - rect.top;
            
            // Calculate momentum based on drag speed and direction
            const dragDuration = Date.now() - dragStartTime;
            const dragDistance = Math.sqrt(
                Math.pow(x - lastDragPosition.x, 2) + 
                Math.pow(y - lastDragPosition.y, 2)
            );
            
            // Calculate velocity based on recent movement
            const momentumFactor = Math.min(dragDistance / 10, 3); // Cap momentum
            draggedImage.vx = (x - lastDragPosition.x) * momentumFactor * 0.3;
            draggedImage.vy = (y - lastDragPosition.y) * momentumFactor * 0.3;
            
            draggedImage.isDragged = false;
            draggedImage = null;
            e.preventDefault();
        }
    }
    
    // Add event listeners for background color drag functionality
    // Touch events
    document.addEventListener('touchstart', handleDragStart, { passive: false });
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd, { passive: false });
    
    // Mouse events (for desktop testing)
    document.addEventListener('mousedown', handleDragStart);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    
    // Add event listeners for image dragging
    canvas.addEventListener('mousedown', handleImageDragStart);
    canvas.addEventListener('mousemove', handleImageDragMove);
    canvas.addEventListener('mouseup', handleImageDragEnd);
    canvas.addEventListener('touchstart', handleImageDragStart, { passive: false });
    canvas.addEventListener('touchmove', handleImageDragMove, { passive: false });
    canvas.addEventListener('touchend', handleImageDragEnd, { passive: false });
    
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
                // Store image with position in lower 3/4 of page
                const imageSize = 100;
                const textCenterX = canvas.width / 2;
                const lowerAreaStartY = canvas.height * 0.25; // Start below upper 1/4
                const lowerAreaHeight = canvas.height * 0.75; // Use lower 3/4
                const clusterRadius = Math.min(150, Math.min(canvas.width, canvas.height) * 0.25); // Smaller radius
                
                // Generate position in lower area
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * clusterRadius;
                const x = textCenterX + Math.cos(angle) * distance - imageSize / 2;
                const y = lowerAreaStartY + (lowerAreaHeight * 0.3) + Math.sin(angle) * distance - imageSize / 2;
                
                images.push({
                    image: img,
                    x: Math.max(0, Math.min(x, canvas.width - imageSize)), // Clamp to bounds
                    y: Math.max(0, Math.min(y, canvas.height - imageSize)), // Clamp to bounds
                    width: imageSize, // Fixed size of 100px
                    height: imageSize, // Fixed size of 100px
                    tilt: (Math.random() - 0.5) * 0.3, // Slight tilt left or right (in radians)
                    vx: 0, // Velocity X
                    vy: 0, // Velocity Y
                    isDragged: false, // Track if being dragged
                    bounce: 0.8 // Bounce damping factor
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
            
            // Apply physics if not being dragged
            if (!imgData.isDragged) {
                // Apply velocity (momentum)
                imgData.x += imgData.vx;
                imgData.y += imgData.vy;
                
                // Bounce off edges
                const imageSize = 100;
                if (imgData.x <= 0) {
                    imgData.x = 0;
                    imgData.vx *= -imgData.bounce;
                }
                if (imgData.x >= canvas.width - imageSize) {
                    imgData.x = canvas.width - imageSize;
                    imgData.vx *= -imgData.bounce;
                }
                if (imgData.y <= 0) {
                    imgData.y = 0;
                    imgData.vy *= -imgData.bounce;
                }
                if (imgData.y >= canvas.height - imageSize) {
                    imgData.y = canvas.height - imageSize;
                    imgData.vy *= -imgData.bounce;
                }
                
                // Apply friction (gradual momentum loss)
                imgData.vx *= 0.99;
                imgData.vy *= 0.99;
            }
            
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
