// API Configuration
const OPENAI_API_KEY = OPENAI_API_KEY; 
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

// DOM Elements
const categoryInput = document.getElementById('categoryInput');
const generateBtn = document.getElementById('generateBtn');
const certificatesContainer = document.getElementById('certificates-container');
const loadingElement = document.getElementById('loading');

// Certificate assets
const certificateBackgrounds = [
    'assets/backgrounds/background1.jpg',
    'assets/backgrounds/background2.jpg',
    'assets/backgrounds/background3.jpg',
    'assets/backgrounds/background4.jpg',
    'assets/textures/linen.jpg',
    'assets/textures/watercolor.jpg',
    'assets/textures/parchment.jpg',
    'assets/textures/subtle-noise.jpg'
];

const certificateIcons = {
    badge: 'assets/icons/badge.svg',
    medal: 'assets/icons/medal.svg',
    ribbon: 'assets/icons/ribbon.svg',
    seal: 'assets/icons/seal.svg'
};

// Event Listeners
generateBtn.addEventListener('click', generateCertificates);

async function generateCertificates() {
    const category = categoryInput.value.trim();
    if (!category) {
        alert('Please enter a category name');
        return;
    }

    // Show loading indicator
    loadingElement.classList.remove('hidden');
    certificatesContainer.innerHTML = '';

    try {
        // Step 1: Get design concepts from OpenAI
        const designConcepts = await getDesignConceptsFromOpenAI(category);
        
        // Step 2: Generate certificates based on these concepts
        for (let i = 0; i < 5; i++) {
            const concept = designConcepts[i] || {};
            await generateCertificateCanvas(category, concept, i);
        }

        // Celebrate!
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    } catch (error) {
        console.error('Error generating certificates:', error);
        alert('Failed to generate certificates. Please try again.');
    } finally {
        loadingElement.classList.add('hidden');
    }
}

async function getDesignConceptsFromOpenAI(category) {
    const prompt = `
    Generate 5 different certificate design concepts for the category: "${category}".
    For each concept, provide:
    1. A color scheme (primary and secondary colors)
    2. A design style (e.g., modern, elegant, playful, professional, vintage, achievement)
    3. Key visual elements to include (e.g., icons, borders, patterns)
    4. Suggested typography (font styles for title and body text)
    5. Any special effects (e.g., gradients, shadows, textures)

    Return the response as a JSON array of objects with these properties:
    - colorScheme: {primary: string, secondary: string}
    - designStyle: string
    - visualElements: string[]
    - typography: {title: string, body: string}
    - specialEffects: string[]
    `;

    try {
        const response = await fetch(OPENAI_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7
            })
        });

        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        
        try {
            return JSON.parse(content);
        } catch (e) {
            console.error('Failed to parse OpenAI response:', content);
            return generateFallbackDesigns();
        }
    } catch (error) {
        console.error('OpenAI API error:', error);
        return generateFallbackDesigns();
    }
}

function generateFallbackDesigns() {
    // Fallback designs if OpenAI fails
    return [
        {
            colorScheme: { primary: '#3498db', secondary: '#2980b9' },
            designStyle: 'modern',
            visualElements: ['geometric patterns', 'badge icon'],
            typography: { title: 'bold 36px Arial', body: '18px Arial' },
            specialEffects: ['gradient background']
        },
        {
            colorScheme: { primary: '#e74c3c', secondary: '#c0392b' },
            designStyle: 'elegant',
            visualElements: ['border', 'ribbon icon'],
            typography: { title: 'italic 36px Georgia', body: '18px Garamond' },
            specialEffects: ['texture']
        },
        {
            colorScheme: { primary: '#2ecc71', secondary: '#27ae60' },
            designStyle: 'professional',
            visualElements: ['seal icon'],
            typography: { title: 'bold 32px Times New Roman', body: '16px Times New Roman' },
            specialEffects: []
        },
        {
            colorScheme: { primary: '#f39c12', secondary: '#d35400' },
            designStyle: 'achievement',
            visualElements: ['medal icon'],
            typography: { title: 'bold 40px Impact', body: '20px Arial' },
            specialEffects: ['gradient background']
        },
        {
            colorScheme: { primary: '#9b59b6', secondary: '#8e44ad' },
            designStyle: 'vintage',
            visualElements: ['border', 'pattern'],
            typography: { title: '36px "Courier New"', body: '18px "Courier New"' },
            specialEffects: ['texture']
        }
    ];
}

async function generateCertificateCanvas(category, concept, index) {
    // Create container for this certificate
    const certificateItem = document.createElement('div');
    certificateItem.className = 'certificate-item';
    
    // Canvas container
    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'canvas-container';
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    canvas.id = `certificate-canvas-${index}`;
    
    // Code container
    const codeContainer = document.createElement('div');
    codeContainer.className = 'code-container';
    
    // Assemble the DOM
    canvasContainer.appendChild(canvas);
    certificateItem.appendChild(canvasContainer);
    certificateItem.appendChild(codeContainer);
    certificatesContainer.appendChild(certificateItem);
    
    // Get canvas context
    const ctx = canvas.getContext('2d');
    
    try {
        // Load background image
        await loadBackgroundImage(ctx, index);
        
        // Apply design concept
        await applyDesignConcept(ctx, category, concept);
        
        // Generate the code for this certificate
        generateCodeSnippet(codeContainer, category, concept, index);
    } catch (error) {
        console.error('Error generating canvas:', error);
    }
}

async function loadBackgroundImage(ctx, index) {
    // Use modulo to cycle through available backgrounds
    const bgIndex = index % certificateBackgrounds.length;
    const bgUrl = certificateBackgrounds[bgIndex];
    
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            // Draw the background
            ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
            resolve();
        };
        img.onerror = reject;
        img.src = bgUrl;
    });
}

async function applyDesignConcept(ctx, category, concept) {
    const { width, height } = ctx.canvas;
    
    // Apply color scheme
    if (concept.colorScheme) {
        // Create gradient background if specified
        if (concept.specialEffects?.includes('gradient background')) {
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, concept.colorScheme.primary);
            gradient.addColorStop(1, concept.colorScheme.secondary);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }
        
        // Apply texture if specified
        if (concept.specialEffects?.includes('texture')) {
            await applyTextureOverlay(ctx, concept);
        }
    }
    
    // Add decorative elements
    await addDecorativeElements(ctx, concept);
    
    // Add certificate content
    addCertificateContent(ctx, category, concept);
}

async function applyTextureOverlay(ctx, concept) {
    const { width, height } = ctx.canvas;
    
    return new Promise((resolve) => {
        const textureImg = new Image();
        textureImg.onload = () => {
            ctx.globalAlpha = 0.3;
            const pattern = ctx.createPattern(textureImg, 'repeat');
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, width, height);
            ctx.globalAlpha = 1.0;
            resolve();
        };
        
        // Use a texture based on design style
        if (concept.designStyle.includes('vintage')) {
            textureImg.src = 'assets/textures/parchment.jpg';
        } else if (concept.designStyle.includes('watercolor')) {
            textureImg.src = 'assets/textures/watercolor.jpg';
        } else {
            textureImg.src = 'assets/textures/linen.jpg';
        }
    });
}

async function addDecorativeElements(ctx, concept) {
    const { width, height } = ctx.canvas;
    
    // Add borders if specified
    if (concept.visualElements?.includes('border')) {
        ctx.strokeStyle = concept.colorScheme?.secondary || '#000000';
        ctx.lineWidth = 10;
        ctx.strokeRect(50, 50, width - 100, height - 100);
    }
    
    // Add geometric patterns if specified
    if (concept.visualElements?.includes('geometric patterns')) {
        ctx.fillStyle = concept.colorScheme?.primary || '#3498db';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 30 + 10;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 0.2;
        }
        ctx.globalAlpha = 1.0;
    }
    
    // Add icons if specified
    if (concept.visualElements?.some(el => el.includes('icon'))) {
        await addIconToCanvas(ctx, concept);
    }
}

async function addIconToCanvas(ctx, concept) {
    const { width, height } = ctx.canvas;
    
    return new Promise((resolve) => {
        // Select an appropriate icon based on the concept
        let iconPath;
        if (concept.designStyle.includes('elegant')) {
            iconPath = certificateIcons.ribbon;
        } else if (concept.designStyle.includes('professional')) {
            iconPath = certificateIcons.seal;
        } else if (concept.designStyle.includes('achievement')) {
            iconPath = certificateIcons.medal;
        } else {
            iconPath = certificateIcons.badge;
        }
        
        // Load and draw the SVG icon
        const img = new Image();
        img.onload = () => {
            // Draw icon in bottom right corner
            const iconSize = 80;
            ctx.drawImage(img, width - 120, height - 120, iconSize, iconSize);
            resolve();
        };
        img.src = iconPath;
    });
}

function addCertificateContent(ctx, category, concept) {
    const { width, height } = ctx.canvas;
    
    // Certificate title
    ctx.textAlign = 'center';
    ctx.fillStyle = concept.colorScheme?.primary || '#3498db';
    ctx.font = concept.typography?.title || 'bold 36px Arial';
    ctx.fillText(category, width / 2, 150);
    
    // Certificate body
    ctx.fillStyle = '#333333';
    ctx.font = concept.typography?.body || '18px Arial';
    ctx.fillText('This certificate is proudly presented to', width / 2, 220);
    
    // Recipient name (placeholder)
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 28px Arial';
    ctx.fillText('[Recipient Name]', width / 2, 280);
    
    // Description
    ctx.fillStyle = '#555555';
    ctx.font = concept.typography?.body || '18px Arial';
    ctx.fillText('For outstanding achievement and completion of the program', width / 2, 330);
    
    // Date and signature
    ctx.textAlign = 'left';
    ctx.fillText('Date: __________', 150, 450);
    ctx.textAlign = 'right';
    ctx.fillText('Signature: __________', width - 150, 450);
}

function generateCodeSnippet(container, category, concept, index) {
    const bgPath = certificateBackgrounds[index % certificateBackgrounds.length];
    const isTexture = concept.specialEffects?.includes('texture');
    const texturePath = isTexture ? 
        (concept.designStyle.includes('vintage') ? 'assets/textures/parchment.jpg' :
         concept.designStyle.includes('watercolor') ? 'assets/textures/watercolor.jpg' :
         'assets/textures/linen.jpg') : '';
    
    const iconType = concept.designStyle.includes('elegant') ? 'ribbon' :
                    concept.designStyle.includes('professional') ? 'seal' :
                    concept.designStyle.includes('achievement') ? 'medal' : 'badge';
    
    const code = `
// Certificate ${index + 1} - ${category}
const canvas = document.getElementById('certificate-canvas-${index}');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = 800;
canvas.height = 600;

// Apply background
const bgImg = new Image();
bgImg.src = '${bgPath}';
bgImg.onload = () => {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    
    ${concept.specialEffects?.includes('gradient background') ? 
        `// Apply gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '${concept.colorScheme?.primary || '#3498db'}');
        gradient.addColorStop(1, '${concept.colorScheme?.secondary || '#2980b9'}');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);` : ''}
    
    ${isTexture ? 
        `// Apply texture
        const textureImg = new Image();
        textureImg.src = '${texturePath}';
        textureImg.onload = () => {
            ctx.globalAlpha = 0.3;
            const pattern = ctx.createPattern(textureImg, 'repeat');
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1.0;
        };` : ''}
    
    // Add decorative elements
    ${concept.visualElements?.includes('border') ? 
        `ctx.strokeStyle = '${concept.colorScheme?.secondary || '#000000'}';
        ctx.lineWidth = 10;
        ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);` : ''}
    
    ${concept.visualElements?.some(el => el.includes('icon')) ? 
        `// Add icon
        const iconImg = new Image();
        iconImg.src = 'assets/icons/${iconType}.svg';
        iconImg.onload = () => {
            ctx.drawImage(iconImg, canvas.width - 120, canvas.height - 120, 80, 80);
        };` : ''}
    
    // Add certificate content
    ctx.textAlign = 'center';
    ctx.fillStyle = '${concept.colorScheme?.primary || '#3498db'}';
    ctx.font = '${concept.typography?.title || 'bold 36px Arial'}';
    ctx.fillText('${category}', canvas.width / 2, 150);
    
    ctx.fillStyle = '#333333';
    ctx.font = '${concept.typography?.body || '18px Arial'}';
    ctx.fillText('This certificate is proudly presented to', canvas.width / 2, 220);
    
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 28px Arial';
    ctx.fillText('[Recipient Name]', canvas.width / 2, 280);
    
    ctx.fillStyle = '#555555';
    ctx.font = '${concept.typography?.body || '18px Arial'}';
    ctx.fillText('For outstanding achievement and completion of the program', canvas.width / 2, 330);
    
    ctx.textAlign = 'left';
    ctx.fillText('Date: __________', 150, 450);
    ctx.textAlign = 'right';
    ctx.fillText('Signature: __________', canvas.width - 150, 450);
};
    `;
    
    container.textContent = code;
}