// admin-script.js - JavaScript para el Panel de Administración

class AdminPanel {
    constructor() {
        this.apiBase = '/api';
        this.isAuthenticated = false;
        this.selectedFile = null;
        this.bulkFiles = [];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.checkAuthStatus();
        this.testBibleAPI();
    }

  // Función corregida para testBibleAPI en admin-script.js
async testBibleAPI() {
    try {
        // Probar la API local en español
        const response = await fetch('bible-verses.php?action=random&category=general');
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.verse && data.text) {
                document.getElementById('apiStatus').innerHTML = '<i class="fas fa-check mr-1"></i>Activa';
                document.getElementById('apiStatus').className = 'text-sm font-bold text-green-600';
                console.log('API bíblica local funcionando correctamente');
                return;
            }
        }
        throw new Error('API local no disponible');
    } catch (error) {
        console.log('API bíblica local no disponible, usando contenido estático');
        document.getElementById('apiStatus').innerHTML = '<i class="fas fa-exclamation-triangle mr-1"></i>Offline';
        document.getElementById('apiStatus').className = 'text-sm font-bold text-yellow-600';
    }
}
    bindEvents() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });
        
        // Upload tabs
        document.getElementById('singleUploadTab').addEventListener('click', () => {
            this.switchToSingleUpload();
        });
        
        document.getElementById('bulkUploadTab').addEventListener('click', () => {
            this.switchToBulkUpload();
        });
        
        // Single upload form
        document.getElementById('uploadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUpload();
        });
        
        // File selection for single upload
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('imageFile');
        
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));
        
        // Drag & Drop for single upload
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handleFileSelect(file);
            }
        });
        
        // Bulk upload events
        const bulkUploadArea = document.getElementById('bulkUploadArea');
        const bulkFileInput = document.getElementById('bulkImageFiles');
        
        bulkUploadArea.addEventListener('click', () => bulkFileInput.click());
        bulkFileInput.addEventListener('change', (e) => this.handleBulkFileSelect(e.target.files));
        
        // Bulk drag & drop
        bulkUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            bulkUploadArea.classList.add('drag-over');
        });
        
        bulkUploadArea.addEventListener('dragleave', () => {
            bulkUploadArea.classList.remove('drag-over');
        });
        
        bulkUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            bulkUploadArea.classList.remove('drag-over');
            const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
            this.handleBulkFileSelect(files);
        });
        
        // Bulk upload actions
        document.getElementById('bulkUploadBtn').addEventListener('click', () => {
            this.handleBulkUpload();
        });
        
        document.getElementById('clearBulkFiles').addEventListener('click', () => {
            this.clearBulkFiles();
        });
        
        // Remove image
        document.getElementById('removeImage').addEventListener('click', () => {
            this.clearFileSelection();
        });
        
        // Generate content buttons
        document.getElementById('generateTitle').addEventListener('click', async () => {
            await this.generateContent('title');
        });
        
        document.getElementById('generateVerse').addEventListener('click', async () => {
            await this.generateContent('verse');
        });
        
        // Auto-generate on category change
        document.getElementById('photoCategory').addEventListener('change', async () => {
            const titleInput = document.getElementById('photoTitle');
            const verseInput = document.getElementById('photoVerse');
            
            if (!titleInput.value.trim() && !verseInput.value.trim()) {
                await this.generateContent('both');
            }
        });
        
        // Auto-fill button
        document.getElementById('autoFillBtn').addEventListener('click', async () => {
            await this.generateContent('both');
        });
        
        // Refresh photos
        document.getElementById('refreshPhotos').addEventListener('click', () => {
            this.loadPhotos();
        });
        
        // Update estimated time when bulk files change
        document.getElementById('bulkCategory').addEventListener('change', () => {
            this.updateEstimatedTime();
        });
    }
    
    switchToSingleUpload() {
        document.getElementById('singleUploadTab').className = 'px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors';
        document.getElementById('bulkUploadTab').className = 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors';
        document.getElementById('singleUploadSection').classList.remove('hidden');
        document.getElementById('bulkUploadSection').classList.add('hidden');
    }
    
    switchToBulkUpload() {
        document.getElementById('singleUploadTab').className = 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors';
        document.getElementById('bulkUploadTab').className = 'px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors';
        document.getElementById('singleUploadSection').classList.add('hidden');
        document.getElementById('bulkUploadSection').classList.remove('hidden');
    }

    // Bible API Integration
async getBibleVerse(category = 'general') {
    try {
        // Intentar usar la API local primero (que ya tiene versículos en español)
        const response = await fetch(`bible-verses.php?action=random&category=${category}`);
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.verse && data.text) {
                return {
                    reference: data.verse,
                    text: data.text,
                    success: true,
                    source: 'local_api'
                };
            }
        }
    } catch (error) {
        console.log('API local falló, usando contenido estático...');
    }

    // Fallback a contenido estático en español
    return this.getStaticVerse(category);
}

getStaticVerse(category) {
    const staticVerses = {
        worship: [
            { reference: 'Salmos 95:1', text: 'Venid, aclamemos alegremente a Jehová; cantemos con júbilo a la roca de nuestra salvación.' },
            { reference: 'Salmos 150:6', text: 'Todo lo que respira alabe a JAH. Aleluya.' },
            { reference: 'Juan 4:24', text: 'Dios es Espíritu; y los que le adoran, en espíritu y en verdad es necesario que adoren.' },
            { reference: 'Salmos 100:2', text: 'Servid a Jehová con alegría; venid ante su presencia con regocijo.' },
            { reference: 'Apocalipsis 4:11', text: 'Señor, digno eres de recibir la gloria y la honra y el poder; porque tú creaste todas las cosas.' },
            { reference: 'Salmos 96:9', text: 'Adorad a Jehová en la hermosura de la santidad; temed delante de él, toda la tierra.' },
            { reference: 'Hebreos 13:15', text: 'Así que, ofrezcamos siempre a Dios, por medio de él, sacrificio de alabanza.' },
            { reference: 'Salmos 103:1', text: 'Bendice, alma mía, a Jehová, y bendiga todo mi ser su santo nombre.' }
        ],
        fellowship: [
            { reference: 'Hebreos 10:25', text: 'No dejando de congregarnos, como algunos tienen por costumbre, sino exhortándonos.' },
            { reference: 'Proverbios 27:17', text: 'Hierro con hierro se aguza; y así el hombre aguza el rostro de su amigo.' },
            { reference: '1 Juan 1:7', text: 'Pero si andamos en luz, como él está en luz, tenemos comunión unos con otros.' },
            { reference: 'Gálatas 6:2', text: 'Sobrellevad los unos las cargas de los otros, y cumplid así la ley de Cristo.' },
            { reference: 'Eclesiastés 4:12', text: 'Y cordón de tres dobleces no se rompe pronto.' },
            { reference: 'Romanos 12:10', text: 'Amaos los unos a los otros con amor fraternal; en cuanto a honra, prefiriéndoos los unos a los otros.' },
            { reference: '1 Tesalonicenses 5:11', text: 'Por lo cual, animaos unos a otros, y edificaos unos a otros, así como lo hacéis.' },
            { reference: 'Filipenses 2:2', text: 'Completad mi gozo, sintiendo lo mismo, teniendo el mismo amor, unánimes, sintiendo una misma cosa.' }
        ],
        events: [
            { reference: 'Deuteronomio 31:6', text: 'Esforzaos y cobrad ánimo; no temáis, ni tengáis miedo de ellos, porque Jehová tu Dios es el que va contigo.' },
            { reference: 'Josué 1:9', text: 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo.' },
            { reference: 'Isaías 40:31', text: 'Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas.' },
            { reference: 'Filipenses 4:13', text: 'Todo lo puedo en Cristo que me fortalece.' },
            { reference: '2 Timoteo 1:7', text: 'Porque no nos ha dado Dios espíritu de cobardía, sino de poder, de amor y de dominio propio.' },
            { reference: 'Jeremías 29:11', text: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz.' },
            { reference: 'Proverbios 3:5-6', text: 'Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.' },
            { reference: 'Salmos 118:24', text: 'Este es el día que hizo Jehová; nos gozaremos y alegraremos en él.' }
        ],
        service: [
            { reference: 'Marcos 16:15', text: 'Y les dijo: Id por todo el mundo y predicad el evangelio a toda criatura.' },
            { reference: 'Mateo 28:19', text: 'Por tanto, id, y haced discípulos a todas las naciones, bautizándolos en el nombre del Padre.' },
            { reference: '1 Pedro 4:10', text: 'Cada uno según el don que ha recibido, minístrelo a los otros, como buenos administradores.' },
            { reference: 'Gálatas 5:13', text: 'Porque vosotros, hermanos, a libertad fuisteis llamados; solamente que no uséis la libertad como ocasión para la carne, sino servíos por amor los unos a los otros.' },
            { reference: 'Mateo 20:28', text: 'Como el Hijo del Hombre no vino para ser servido, sino para servir, y para dar su vida en rescate por muchos.' },
            { reference: 'Juan 13:14', text: 'Pues si yo, el Señor y el Maestro, he lavado vuestros pies, vosotros también debéis lavaros los pies los unos a los otros.' },
            { reference: 'Romanos 12:1', text: 'Así que, hermanos, os ruego por las misericordias de Dios, que presentéis vuestros cuerpos en sacrificio vivo.' },
            { reference: '2 Corintios 9:7', text: 'Cada uno dé como propuso en su corazón: no con tristeza, ni por necesidad, porque Dios ama al dador alegre.' }
        ],
        general: [
            { reference: 'Juan 3:16', text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.' },
            { reference: 'Romanos 8:28', text: 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien.' },
            { reference: 'Salmos 23:1', text: 'Jehová es mi pastor; nada me faltará.' },
            { reference: 'Isaías 41:10', text: 'No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo.' },
            { reference: 'Salmos 46:10', text: 'Estad quietos, y conoced que yo soy Dios; seré exaltado entre las naciones.' },
            { reference: 'Mateo 6:33', text: 'Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.' }
        ],
        youth: [
            { reference: '1 Timoteo 4:12', text: 'Ninguno tenga en poco tu juventud, sino sé ejemplo de los creyentes en palabra, conducta, amor, espíritu, fe y pureza.' },
            { reference: 'Eclesiastés 12:1', text: 'Acuérdate de tu Creador en los días de tu juventud, antes que vengan los días malos.' },
            { reference: 'Salmos 119:9', text: '¿Con qué limpiará el joven su camino? Con guardar tu palabra.' },
            { reference: 'Proverbios 20:29', text: 'La gloria de los jóvenes es su fuerza, y la hermosura de los ancianos es su vejez.' },
            { reference: 'Joel 2:28', text: 'Y después de esto derramaré mi Espíritu sobre toda carne, y profetizarán vuestros hijos y vuestras hijas.' },
            { reference: 'Lamentaciones 3:27', text: 'Bueno le es al hombre llevar el yugo desde su juventud.' }
        ]
    };

    const verses = staticVerses[category] || staticVerses.general;
    const randomVerse = verses[Math.floor(Math.random() * verses.length)];
    
    return {
        reference: randomVerse.reference,
        text: randomVerse.text,
        success: true,
        source: 'static'
    };
}

    getRandomTitle(category) {
        const titles = {
            worship: [
                'Corazones en Adoración', 'Alabanza que Trasciende', 'En Su Presencia', 
                'Voces que Alaban', 'Adoración Celestial', 'Manos Alzadas al Cielo',
                'Cánticos de Esperanza', 'Momentos de Gloria', 'Santidad Revelada'
            ],
            fellowship: [
                'Unidos en Cristo', 'Hermanos en Fe', 'Comunión Verdadera', 
                'Lazos Eternos', 'Familia de la Fe', 'Corazones Unidos',
                'Amistad Divina', 'Caminando Juntos', 'Hermandad Cristiana'
            ],
            events: [
                'Momentos Especiales', 'Recuerdos de Fe', 'Experiencias Transformadoras', 
                'Encuentros Divinos', 'Celebración de Vida', 'Aventuras de Fe',
                'Testimonios Vivientes', 'Huellas de Bendición', 'Milagros Cotidianos'
            ],
            service: [
                'Manos que Sirven', 'Corazón de Siervo', 'Amor en Acción', 
                'Sirviendo con Gozo', 'Misión Cumplida', 'Compasión Cristiana',
                'Entrega Total', 'Fe que Actúa', 'Llamado al Servicio'
            ]
        };

        const categoryTitles = titles[category] || titles.fellowship;
        return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
    }
    
    async generateContent(type) {
        const category = document.getElementById('photoCategory').value;
        const generateBtn = document.getElementById(type === 'title' ? 'generateTitle' : 'generateVerse');
        
        // Show loading state
        if (generateBtn) {
            const originalHTML = generateBtn.innerHTML;
            generateBtn.innerHTML = '<div class="spinner"></div>';
            generateBtn.disabled = true;
        }
        
        try {
            if (type === 'title' || type === 'both') {
                const title = this.getRandomTitle(category);
                document.getElementById('photoTitle').value = title;
            }
            
            if (type === 'verse' || type === 'both') {
                const verseData = await this.getBibleVerse(category);
                document.getElementById('photoVerse').value = verseData.reference;
                
                const verseTextDiv = document.getElementById('verseText');
                verseTextDiv.innerHTML = `"${verseData.text}" <span class="text-blue-600">- ${verseData.reference}</span>`;
                verseTextDiv.classList.remove('hidden');
                
                if (verseData.source === 'static') {
                    this.showMessage('Versículo obtenido (modo offline)', 'warning');
                } else {
                    this.showMessage('Versículo obtenido de API bíblica', 'success');
                }
            }
            
            if (type === 'both') {
                this.showMessage('Título y versículo generados exitosamente', 'success');
            } else if (type === 'title') {
                this.showMessage('Título generado exitosamente', 'success');
            }
            
        } catch (error) {
            console.error('Error generating content:', error);
            this.showMessage('Error al generar contenido', 'error');
        } finally {
            // Restore button state
            if (generateBtn) {
                generateBtn.innerHTML = type === 'title' ? '<i class="fas fa-lightbulb"></i>' : '<i class="fas fa-magic"></i>';
                generateBtn.disabled = false;
            }
        }
    }
    
    
    updateEstimatedTime() {
        const fileCount = this.bulkFiles.length;
        const estimatedSeconds = fileCount * 3; // 3 seconds per file including API calls
        document.getElementById('estimatedTime').textContent = estimatedSeconds;
    }
    
    displayBulkPreview(files) {
        const previewSection = document.getElementById('bulkPreviewSection');
        const filesList = document.getElementById('bulkFilesList');
        const fileCount = document.getElementById('fileCount');
        const uploadCount = document.getElementById('uploadCount');
        
        previewSection.classList.remove('hidden');
        fileCount.textContent = files.length;
        uploadCount.textContent = files.length;
        
        filesList.innerHTML = '';
        
        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.className = 'relative group bg-white rounded-lg overflow-hidden shadow-sm border file-preview';
                div.innerHTML = `
                    <img src="${e.target.result}" class="w-full h-20 object-cover">
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex items-center justify-center">
                        <button 
                            onclick="adminPanel.removeBulkFile(${index})"
                            class="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all transform hover:scale-110"
                            title="Remover"
                        >
                            <i class="fas fa-times text-xs"></i>
                        </button>
                    </div>
                    <div class="p-2">
                        <p class="text-xs text-gray-600 truncate" title="${file.name}">${file.name}</p>
                        <div class="flex items-center justify-between mt-1">
                            <span class="text-xs text-blue-600">
                                <i class="fas fa-magic mr-1"></i>Auto
                            </span>
                            <span class="text-xs text-gray-400">${(file.size / 1024 / 1024).toFixed(1)}MB</span>
                        </div>
                    </div>
                `;
                filesList.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    }
    
    removeBulkFile(index) {
        this.bulkFiles.splice(index, 1);
        if (this.bulkFiles.length === 0) {
            this.clearBulkFiles();
        } else {
            this.displayBulkPreview(this.bulkFiles);
            this.updateEstimatedTime();
        }
    }
    
    clearBulkFiles() {
        this.bulkFiles = [];
        document.getElementById('bulkPreviewSection').classList.add('hidden');
        document.getElementById('bulkImageFiles').value = '';
    }
    
    async handleBulkUpload() {
        if (!this.bulkFiles || this.bulkFiles.length === 0) {
            this.showMessage('No hay archivos seleccionados', 'error');
            return;
        }
        
        const category = document.getElementById('bulkCategory').value;
        const baseDescription = document.getElementById('bulkDescription').value || 'Imagen del ministerio juvenil';
        
        // Show progress section
        document.getElementById('bulkProgressSection').classList.remove('hidden');
        document.getElementById('bulkUploadBtn').disabled = true;
        
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const uploadLog = document.getElementById('uploadLog');
        const currentAction = document.getElementById('currentAction');
        
        let uploaded = 0;
        let failed = 0;
        const total = this.bulkFiles.length;
        
        progressText.textContent = `0 / ${total}`;
        uploadLog.innerHTML = '';
        
        this.addToUploadLog('🚀 Iniciando carga masiva inteligente...', 'info');
        
        for (let i = 0; i < this.bulkFiles.length; i++) {
            const file = this.bulkFiles[i];
            
            try {
                currentAction.textContent = `Generando contenido para: ${file.name}`;
                this.addToUploadLog(`📝 Generando contenido para: ${file.name}`, 'info');
                
                // Generate unique content for each photo
                const title = this.getRandomTitle(category);
                const verseData = await this.getBibleVerse(category);
                
                currentAction.textContent = `Subiendo: ${file.name}`;
                this.addToUploadLog(`⬆️ Subiendo: ${file.name} - "${title}"`, 'info');
                
                const formData = new FormData();
                formData.append('image', file);
                formData.append('title', title);
                formData.append('description', baseDescription);
                formData.append('category', category);
                formData.append('verse', verseData.reference);
                formData.append('verse_text', verseData.text);
                
                const response = await fetch(`${this.apiBase}/upload`, {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    uploaded++;
                    this.addToUploadLog(`✅ ${file.name} - "${title}" - ${verseData.reference}`, 'success');
                } else {
                    failed++;
                    this.addToUploadLog(`❌ ${file.name} - Error: ${data.error}`, 'error');
                }
                
            } catch (error) {
                failed++;
                this.addToUploadLog(`❌ ${file.name} - Error de conexión`, 'error');
            }
            
            // Update progress
            const progress = ((i + 1) / total) * 100;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${i + 1} / ${total}`;
            
            // Small delay to prevent server overload and show progress
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Final results
        currentAction.textContent = 'Carga completada';
        this.addToUploadLog(`\n🎉 Carga masiva completada: ${uploaded} exitosas, ${failed} fallidas`, 'success');
        this.showMessage(`Carga masiva completada: ${uploaded} fotos subidas exitosamente con IA bíblica`, 'success');
        
        // Reset and refresh
        setTimeout(() => {
            document.getElementById('bulkProgressSection').classList.add('hidden');
            document.getElementById('bulkUploadBtn').disabled = false;
            this.clearBulkFiles();
            this.loadPhotos();
        }, 3000);
    }
    
    addToUploadLog(message, type = 'info') {
        const uploadLog = document.getElementById('uploadLog');
        const logEntry = document.createElement('div');
        logEntry.className = `text-xs p-1 rounded ${
            type === 'success' ? 'text-green-700 bg-green-50' : 
            type === 'error' ? 'text-red-700 bg-red-50' : 
            'text-blue-700 bg-blue-50'
        }`;
        logEntry.textContent = message;
        uploadLog.appendChild(logEntry);
        uploadLog.scrollTop = uploadLog.scrollHeight;
    }
    
    async checkAuthStatus() {
        try {
            const response = await fetch(`${this.apiBase}/status`);
            const data = await response.json();
            
            if (data.authenticated) {
                this.showAdminPanel(data.user);
                this.loadPhotos();
            } else {
                this.showLoginModal();
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            this.showLoginModal();
        }
    }
    
    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch(`${this.apiBase}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showAdminPanel(data.user);
                this.loadPhotos();
                this.hideLoginError();
            } else {
                this.showLoginError(data.error);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showLoginError('Error de conexión');
        }
    }
    
    async handleLogout() {
        try {
            await fetch(`${this.apiBase}/logout`, { method: 'POST' });
            this.showLoginModal();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
    
    handleFileSelect(file) {
        if (!file || !file.type.startsWith('image/')) {
            this.showMessage('Por favor selecciona un archivo de imagen válido', 'error');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            this.showMessage('El archivo es muy grande. Máximo 10MB', 'error');
            return;
        }
        
        this.selectedFile = file;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('previewImage').src = e.target.result;
            document.getElementById('fileName').textContent = file.name;
            document.getElementById('uploadPlaceholder').classList.add('hidden');
            document.getElementById('uploadPreview').classList.remove('hidden');
            document.getElementById('uploadBtn').disabled = false;
        };
        reader.readAsDataURL(file);
    }
    
    clearFileSelection() {
        this.selectedFile = null;
        document.getElementById('imageFile').value = '';
        document.getElementById('uploadPlaceholder').classList.remove('hidden');
        document.getElementById('uploadPreview').classList.add('hidden');
        document.getElementById('uploadBtn').disabled = false;
        document.getElementById('verseText').classList.add('hidden');
    }
    
    async handleUpload() {
        if (!this.selectedFile) {
            this.showMessage('Por favor selecciona una imagen', 'error');
            return;
        }
        
        const formData = new FormData();
        formData.append('image', this.selectedFile);
        formData.append('title', document.getElementById('photoTitle').value);
        formData.append('description', document.getElementById('photoDescription').value);
        formData.append('category', document.getElementById('photoCategory').value);
        formData.append('verse', document.getElementById('photoVerse').value);
        
        // Add verse text if available
        const verseTextDiv = document.getElementById('verseText');
        if (!verseTextDiv.classList.contains('hidden')) {
            formData.append('verse_text', verseTextDiv.textContent);
        }
        
        const uploadBtn = document.getElementById('uploadBtn');
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<div class="spinner mr-2"></div>Subiendo...';
        
        try {
            const response = await fetch(`${this.apiBase}/upload`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showMessage('Foto subida exitosamente', 'success');
                this.clearForm();
                this.loadPhotos();
            } else {
                this.showMessage(data.error, 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            this.showMessage('Error al subir la foto', 'error');
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<i class="fas fa-upload mr-2"></i>Subir Foto';
        }
    }
    
    async loadPhotos() {
        try {
            const response = await fetch(`${this.apiBase}/photos`);
            const data = await response.json();
            
            this.displayPhotos(data.photos || []);
            this.updateStats(data.photos || []);
        } catch (error) {
            console.error('Error loading photos:', error);
            this.showMessage('Error al cargar las fotos', 'error');
        }
    }
    
    displayPhotos(photos) {
        const grid = document.getElementById('photosGrid');
        const noPhotos = document.getElementById('noPhotos');
        
        if (photos.length === 0) {
            grid.classList.add('hidden');
            noPhotos.classList.remove('hidden');
            return;
        }
        
        grid.classList.remove('hidden');
        noPhotos.classList.add('hidden');
        
        grid.innerHTML = photos.map(photo => `
            <div class="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-all duration-200 photo-card">
                <div class="relative zoom-hover">
                    <img 
                        src="${photo.src}" 
                        alt="${photo.title}"
                        class="w-full h-32 object-cover"
                    >
                    <div class="overlay">
                        <div class="space-x-2">
                            <button 
                                onclick="adminPanel.viewPhoto('${photo.src}')"
                                class="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                title="Ver imagen"
                            >
                                <i class="fas fa-eye"></i>
                            </button>
                            <button 
                                onclick="adminPanel.deletePhoto(${photo.id})"
                                class="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                title="Eliminar"
                            >
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="p-3">
                    <h3 class="font-semibold text-gray-800 text-sm mb-1 truncate">${photo.title}</h3>
                    <p class="text-xs text-gray-600 mb-2 line-clamp-2">${photo.description}</p>
                    <div class="flex justify-between items-center">
                        <span class="tag tag-blue">${this.getCategoryName(photo.category)}</span>
                        <span class="text-xs text-gray-500">${this.formatDate(photo.upload_date)}</span>
                    </div>
                    ${photo.verse ? `<div class="mt-2 text-xs text-purple-600 italic">${photo.verse}</div>` : ''}
                </div>
            </div>
        `).join('');
    }
    
    async deletePhoto(photoId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
            return;
        }
        
        try {
            const response = await fetch(`${this.apiBase}/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: photoId })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showMessage('Foto eliminada exitosamente', 'success');
                this.loadPhotos();
            } else {
                this.showMessage(data.error, 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.showMessage('Error al eliminar la foto', 'error');
        }
    }
    
    viewPhoto(src) {
        window.open(src, '_blank');
    }
    
    updateStats(photos) {
        document.getElementById('totalPhotos').textContent = photos.length;
        
        // Count today's uploads
        const today = new Date().toISOString().split('T')[0];
        const todayUploads = photos.filter(photo => 
            photo.upload_date && photo.upload_date.startsWith(today)
        ).length;
        document.getElementById('todayUploads').textContent = todayUploads;
    }
    
    getCategoryName(category) {
        const categories = {
            'worship': '🙏 Alabanza',
            'fellowship': '🤝 Comunión',
            'events': '🎉 Eventos',
            'service': '❤️ Servicio'
        };
        return categories[category] || category;
    }
    
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    clearForm() {
        document.getElementById('uploadForm').reset();
        this.clearFileSelection();
    }
    
    showAdminPanel(username) {
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        document.getElementById('adminUsername').textContent = username;
        this.isAuthenticated = true;
    }
    
    showLoginModal() {
        document.getElementById('loginModal').classList.remove('hidden');
        document.getElementById('adminPanel').classList.add('hidden');
        this.isAuthenticated = false;
        document.getElementById('loginForm').reset();
        this.hideLoginError();
    }
    
    showLoginError(message) {
        const errorElement = document.getElementById('loginError');
        const errorText = document.getElementById('loginErrorText');
        errorText.textContent = message;
        errorElement.classList.remove('hidden');
    }
    
    hideLoginError() {
        document.getElementById('loginError').classList.add('hidden');
    }
    
    showMessage(message, type = 'info') {
        const container = document.getElementById('messageContainer');
        const messageId = Date.now();
        
        const messageElement = document.createElement('div');
        messageElement.className = `mb-4 p-4 rounded-lg shadow-lg notification max-w-sm`;
        messageElement.id = `message-${messageId}`;
        
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white',
            warning: 'bg-yellow-500 text-black'
        };
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle'
        };
        
        messageElement.className += ` ${colors[type] || colors.info}`;
        messageElement.innerHTML = `
            <div class="flex items-center">
                <i class="${icons[type] || icons.info} mr-3"></i>
                <span class="flex-1 text-sm">${message}</span>
                <button 
                    onclick="adminPanel.removeMessage('${messageId}')"
                    class="ml-3 text-white hover:text-gray-200 focus:outline-none"
                >
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        container.appendChild(messageElement);
        
        // Animate in
        setTimeout(() => {
            messageElement.classList.add('show');
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            this.removeMessage(messageId);
        }, 5000);
    }
    
    removeMessage(messageId) {
        const element = document.getElementById(`message-${messageId}`);
        if (element) {
            element.classList.remove('show');
            setTimeout(() => {
                element.remove();
            }, 300);
        }
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize admin panel
    const adminPanel = new AdminPanel();
    
    // Make admin panel globally accessible
    window.adminPanel = adminPanel;
    
    // Enhanced user experience: Auto-save form data
    let formData = {};
    
    // Save form data to localStorage on input
    document.addEventListener('input', (e) => {
        if (e.target.id && ['photoTitle', 'photoDescription', 'photoCategory', 'bulkDescription', 'bulkCategory'].includes(e.target.id)) {
            formData[e.target.id] = e.target.value;
            try {
                localStorage.setItem('adminFormData', JSON.stringify(formData));
            } catch (error) {
                console.log('Could not save form data to localStorage');
            }
        }
    });
    
    // Restore form data on page load
    try {
        const savedData = localStorage.getItem('adminFormData');
        if (savedData) {
            formData = JSON.parse(savedData);
            Object.keys(formData).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    element.value = formData[key];
                }
            });
        }
    } catch (error) {
        console.log('No saved form data found');
    }
    
    // Clear saved data when upload is successful
    window.addEventListener('upload-success', () => {
        try {
            localStorage.removeItem('adminFormData');
            formData = {};
        } catch (error) {
            console.log('Could not clear saved form data');
        }
    });
    
    // Add keyboard shortcuts for power users
    document.addEventListener('keydown', (e) => {
        // Ctrl+U for upload
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            const uploadBtn = document.getElementById('uploadBtn');
            if (uploadBtn && !uploadBtn.disabled) {
                uploadBtn.click();
            }
        }
        
        // Ctrl+G for generate content
        if (e.ctrlKey && e.key === 'g') {
            e.preventDefault();
            const autoFillBtn = document.getElementById('autoFillBtn');
            if (autoFillBtn) {
                autoFillBtn.click();
            }
        }
        
        // Escape to clear selection
        if (e.key === 'Escape') {
            if (adminPanel.selectedFile) {
                adminPanel.clearFileSelection();
            } else if (adminPanel.bulkFiles.length > 0) {
                adminPanel.clearBulkFiles();
            }
        }
    });
    
    // Add visual feedback for file drag over entire page
    let dragCounter = 0;
    
    document.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dragCounter++;
        if (dragCounter === 1) {
            document.body.classList.add('drag-active');
        }
    });
    
    document.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dragCounter--;
        if (dragCounter === 0) {
            document.body.classList.remove('drag-active');
        }
    });
    
    document.addEventListener('drop', (e) => {
        e.preventDefault();
        dragCounter = 0;
        document.body.classList.remove('drag-active');
    });
    
    console.log('🎉 Panel de Administración Cargado');
    console.log('📖 APIs Bíblicas Configuradas');
    console.log('🚀 Carga Masiva Habilitada');
    console.log('⌨️ Atajos: Ctrl+U (Subir), Ctrl+G (Generar), Esc (Limpiar)');
});