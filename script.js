// Funções utilitárias

// Função para reproduzir som de sucesso
function playSuccessSound() {
    const audio = document.getElementById('successSound');
    if (audio) {
        audio.currentTime = 0;
        audio.play();
    }
}

// Função para reproduzir som de favorito
function playFavoriteSound() {
    const audio = document.getElementById('favoriteSound');
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio play failed:', e));
    }
}

// Função para reproduzir som de erro simples
function playErrorSound() {
    const audio = document.getElementById('errorSound');
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio play failed:', e));
    }
}

// Função para reproduzir som de muitos erros
function playManyErrorsSound() {
    const audio = document.getElementById('manyErrorsSound');
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio play failed:', e));
    }
}

// Contador global de erros
let errorCount = 0;

// Função para incrementar contador de erros e tocar áudio apropriado
function incrementErrorCount() {
    errorCount++;
    
    // Se houver muitos erros (5+), tocar o áudio de muitos erros (apenas uma vez)
    if (errorCount >= 5) {
        playManyErrorsSound();
    } else {
        // Para erros normais, tocar o áudio de erro simples (apenas uma vez)
        playErrorSound();
    }
}

// Sistema de Favoritos
class FavoritesManager {
    constructor() {
        this.favorites = this.loadFavorites();
        this.init();
    }

    init() {
        // Adicionar botões de favorito aos cards existentes
        this.addFavoriteButtons();
        // Atualizar estado dos botões
        this.updateFavoriteButtons();
        // Adicionar seção de favoritos se houver itens
        this.updateFavoritesSection();
    }

    loadFavorites() {
        const stored = localStorage.getItem('characterFavorites');
        return stored ? JSON.parse(stored) : [];
    }

    saveFavorites() {
        localStorage.setItem('characterFavorites', JSON.stringify(this.favorites));
    }

    addFavorite(character, unicode, name) {
            const existingIndex = this.favorites.findIndex(fav => fav.unicode === unicode || fav.code === unicode);
            if (existingIndex === -1) {
                // Ensure dual compatibility
                this.favorites.push({ character, unicode, name, char: character, code: unicode, page: unicode });
                this.saveFavorites();
                playFavoriteSound();
                showToast('Adicionado aos favoritos!', 'success');
            } else {
                this.removeFavorite(unicode);
            }
        this.updateFavoriteButtons();
        this.updateFavoritesSection();
    }

    removeFavorite(unicode) {
        this.favorites = this.favorites.filter(fav => fav.unicode !== unicode && fav.code !== unicode);
        this.saveFavorites();
        showToast('Removido dos favoritos', 'info');
    }

    isFavorite(unicode) {
        return this.favorites.some(fav => fav.unicode === unicode || fav.code === unicode);
    }

    addFavoriteButtons() {
        const cards = document.querySelectorAll('.character-card');
        cards.forEach(card => {
            const unicode = card.querySelector('p').textContent;
            const character = card.querySelector('.character-display').textContent;
            const name = card.querySelector('h3').textContent;
            
            // Verificar se já tem botão de favorito
            if (!card.querySelector('.favorite-btn') && !card.querySelector('.btn-favorite')) {
                const actionsDiv = card.querySelector('.card-actions');
                const favoriteBtn = document.createElement('button');
                favoriteBtn.className = 'btn btn-sm favorite-btn';
                favoriteBtn.innerHTML = '<i class="far fa-heart"></i> Favoritar';
                favoriteBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.addFavorite(character, unicode, name);
                };
                actionsDiv.appendChild(favoriteBtn);
            }
        });
    }

    updateFavoriteButtons() {
        const cards = document.querySelectorAll('.character-card');
        cards.forEach(card => {
            const unicode = card.querySelector('p').textContent;
            const favoriteBtn = card.querySelector('.favorite-btn');
            if (favoriteBtn) {
                if (this.isFavorite(unicode)) {
                    favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Desfavoritar';
                    favoriteBtn.classList.add('favorited');
                } else {
                    favoriteBtn.innerHTML = '<i class="far fa-heart"></i> Favoritar';
                    favoriteBtn.classList.remove('favorited');
                }
            }
        });
    }

    updateFavoritesSection() {
        // Se renderFavorites (de index.html) existir, chama ele para não duplicar seções
        if (typeof renderFavorites === 'function') {
            renderFavorites();
            return;
        }

        // Remover seção existente
        const existingSection = document.getElementById('favorites-section');
        if (existingSection) {
            existingSection.remove();
        }

        if (this.favorites.length > 0) {
            const charactersSection = document.getElementById('characters');
            const favoritesSection = document.createElement('section');
            favoritesSection.id = 'favorites-section';
            favoritesSection.className = 'characters';
            favoritesSection.innerHTML = `
                <div class="container">
                    <h2 class="section-title">Meus Favoritos</h2>
                    <div class="character-grid" id="favorites-grid">
                        ${this.favorites.map(fav => `
                            <div class="character-card">
                                <div class="character-display">${fav.character}</div>
                                <h3>${fav.name}</h3>
                                <p>${fav.unicode}</p>
                                <div class="card-actions">
                                    <button class="btn btn-sm btn-primary" onclick="copyCharacter('${fav.character}', event)">
                                        <i class="fas fa-copy"></i> Copiar
                                    </button>
                                    <button class="btn btn-sm btn-secondary" onclick="shareCharacter('${fav.character}', '${fav.unicode}', event)">
                                        <i class="fas fa-share-alt"></i> Compartilhar
                                    </button>
                                    <button class="btn btn-sm favorite-btn favorited" onclick="favoritesManager.addFavorite('${fav.character}', '${fav.unicode}', '${fav.name}', event)">
                                        <i class="fas fa-heart"></i> Desfavoritar
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            charactersSection.parentNode.insertBefore(favoritesSection, charactersSection);
        }
    }
}

// Sistema de Categorias e Tags Avançado
class CategoryTagManager {
    constructor() {
        this.categories = this.initializeCategories();
        this.tags = this.initializeTags();
        this.characterData = this.initializeCharacterData();
        this.activeFilters = {
            category: 'all',
            tags: []
        };
        this.init();
    }

    initializeCategories() {
        return {
            'all': { name: 'Todos', icon: 'fas fa-th', color: '#6366f1' },
            'spaces': { name: 'Espaços', icon: 'fas fa-space', color: '#22d3ee' },
            'symbols': { name: 'Símbolos', icon: 'fas fa-asterisk', color: '#f59e0b' },
            'math': { name: 'Matemáticos', icon: 'fas fa-calculator', color: '#10b981' },
            'arrows': { name: 'Setas', icon: 'fas fa-arrows-alt', color: '#ef4444' },
            'faces': { name: 'Faces', icon: 'fas fa-smile', color: '#8b5cf6' },
            'shapes': { name: 'Formas', icon: 'fas fa-shapes', color: '#f97316' },
            'special': { name: 'Especiais', icon: 'fas fa-star', color: '#ec4899' },
            'invisible': { name: 'Invisíveis', icon: 'fas fa-eye-slash', color: '#6b7280' },
            'custom': { name: 'Personalizados', icon: 'fas fa-cog', color: '#14b8a6' }
        };
    }

    initializeTags() {
        return {
            'popular': { name: 'Popular', color: '#ef4444' },
            'unicode': { name: 'Unicode', color: '#3b82f6' },
            'social': { name: 'Social', color: '#10b981' },
            'hidden': { name: 'Oculto', color: '#6b7280' },
            'rare': { name: 'Raro', color: '#8b5cf6' },
            'useful': { name: 'Útil', color: '#f59e0b' },
            'fun': { name: 'Divertido', color: '#ec4899' },
            'professional': { name: 'Profissional', color: '#6366f1' },
            'artistic': { name: 'Artístico', color: '#14b8a6' },
            'technical': { name: 'Técnico', color: '#f97316' }
        };
    }

    initializeCharacterData() {
        return {
            '｜': { 
                name: 'Vertical Line', 
                category: 'symbols', 
                tags: ['popular', 'useful', 'technical'],
                description: 'Linha vertical usada para separação visual'
            },
            'ㅤ': { 
                name: 'Invisível Coreano', 
                category: 'invisible', 
                tags: ['hidden', 'unicode', 'rare'],
                description: 'Caractere invisível do alfabeto coreano'
            },
            ' ': { 
                name: 'Invisível Médio', 
                category: 'invisible', 
                tags: ['hidden', 'unicode', 'useful'],
                description: 'Espaço invisível de largura média'
            },
            ' ': { 
                name: 'Invisível Fino', 
                category: 'invisible', 
                tags: ['hidden', 'unicode', 'rare'],
                description: 'Espaço invisível de largura fina'
            },
            '🫪': { 
                name: 'Distorted Face', 
                category: 'faces', 
                tags: ['popular', 'fun', 'social'],
                description: 'Face distorcida para expressões'
            }
        };
    }

    init() {
        this.createCategoryFilter();
        this.createTagFilter();
        this.setupSearchIntegration();
        this.updateCharacterDisplay();
    }

    createCategoryFilter() {
        const characterGrid = document.getElementById('characterGrid') || document.getElementById('searchResults');
        if (!characterGrid) return;
        
        const filterContainer = document.createElement('div');
        filterContainer.className = 'filter-container';
        filterContainer.innerHTML = `
            <h3 class="filter-title">Categorias</h3>
            <div class="category-filters" id="categoryFilters">
                ${Object.entries(this.categories).map(([key, cat]) => `
                    <button class="category-btn ${key === 'all' ? 'active' : ''}" 
                            data-category="${key}" 
                            style="--cat-color: ${cat.color}">
                        <i class="${cat.icon}"></i>
                        <span>${cat.name}</span>
                    </button>
                `).join('')}
            </div>
        `;
        
        characterGrid.parentNode.insertBefore(filterContainer, characterGrid);
        
        // Adicionar eventos
        filterContainer.addEventListener('click', (e) => {
            if (e.target.closest('.category-btn')) {
                const btn = e.target.closest('.category-btn');
                const category = btn.dataset.category;
                this.setCategoryFilter(category);
            }
        });
    }

    createTagFilter() {
        const filterContainer = document.querySelector('.filter-container');
        const tagFilterHtml = `
            <h3 class="filter-title">Tags</h3>
            <div class="tag-filters" id="tagFilters">
                ${Object.entries(this.tags).map(([key, tag]) => `
                    <button class="tag-btn" 
                            data-tag="${key}" 
                            style="--tag-color: ${tag.color}">
                        <span>${tag.name}</span>
                    </button>
                `).join('')}
            </div>
            <div class="active-filters" id="activeFilters">
                <div class="filter-summary">
                    <span id="filterCount">Mostrando todos os caracteres</span>
                    <button class="clear-filters-btn" onclick="categoryTagManager.clearAllFilters()" style="display: none;">
                        <i class="fas fa-times"></i> Limpar filtros
                    </button>
                </div>
            </div>
        `;
        
        filterContainer.insertAdjacentHTML('beforeend', tagFilterHtml);
        
        // Adicionar eventos
        filterContainer.addEventListener('click', (e) => {
            if (e.target.closest('.tag-btn')) {
                const btn = e.target.closest('.tag-btn');
                const tag = btn.dataset.tag;
                this.toggleTagFilter(tag);
            }
        });
    }

    setCategoryFilter(category) {
        this.activeFilters.category = category;
        this.updateCategoryButtons();
        
        // Se estiver na página de busca, filtrar resultados existentes
        if (document.getElementById('searchResults')) {
            const searchInput = document.querySelector('.search-box input');
            this.filterExistingResults(searchInput?.value || '');
        } else {
            this.updateCharacterDisplay();
            this.updateFilterSummary();
        }
    }

    toggleTagFilter(tag) {
        const index = this.activeFilters.tags.indexOf(tag);
        if (index > -1) {
            this.activeFilters.tags.splice(index, 1);
        } else {
            this.activeFilters.tags.push(tag);
        }
        this.updateTagButtons();
        
        // Se estiver na página de busca, filtrar resultados existentes
        if (document.getElementById('searchResults')) {
            const searchInput = document.querySelector('.search-box input');
            this.filterExistingResults(searchInput?.value || '');
        } else {
            this.updateCharacterDisplay();
            this.updateFilterSummary();
        }
    }

    clearAllFilters() {
        this.activeFilters = { category: 'all', tags: [] };
        this.updateCategoryButtons();
        this.updateTagButtons();
        
        // Se estiver na página de busca, filtrar resultados existentes
        if (document.getElementById('searchResults')) {
            const searchInput = document.querySelector('.search-box input');
            this.filterExistingResults(searchInput?.value || '');
        } else {
            this.updateCharacterDisplay();
            this.updateFilterSummary();
        }
    }

    updateCategoryButtons() {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === this.activeFilters.category);
        });
    }

    updateTagButtons() {
        document.querySelectorAll('.tag-btn').forEach(btn => {
            btn.classList.toggle('active', this.activeFilters.tags.includes(btn.dataset.tag));
        });
    }

    updateFilterSummary() {
        const filterCount = document.getElementById('filterCount');
        const clearBtn = document.querySelector('.clear-filters-btn');
        
        const hasFilters = this.activeFilters.category !== 'all' || this.activeFilters.tags.length > 0;
        clearBtn.style.display = hasFilters ? 'flex' : 'none';
        
        if (hasFilters) {
            const categoryName = this.categories[this.activeFilters.category].name;
            const tagNames = this.activeFilters.tags.map(tag => this.tags[tag].name);
            let summary = `Filtrando por: ${categoryName}`;
            if (tagNames.length > 0) {
                summary += ` + ${tagNames.join(', ')}`;
            }
            filterCount.textContent = summary;
        } else {
            filterCount.textContent = 'Mostrando todos os caracteres';
        }
    }

    getFilteredCharacters() {
        return Object.entries(this.characterData).filter(([unicode, data]) => {
            const categoryMatch = this.activeFilters.category === 'all' || 
                               data.category === this.activeFilters.category;
            const tagsMatch = this.activeFilters.tags.length === 0 || 
                             this.activeFilters.tags.some(tag => data.tags.includes(tag));
            return categoryMatch && tagsMatch;
        });
    }

    updateCharacterDisplay() {
        const characterGrid = document.getElementById('characterGrid');
        const searchResults = document.getElementById('searchResults');
        const targetContainer = characterGrid || searchResults;
        
        if (!targetContainer) return;
        
        // Se estiver na página de busca, não substituir o conteúdo existente
        if (searchResults && !characterGrid) {
            this.setupSearchPageFilters();
            return;
        }
        
        const filteredCharacters = this.getFilteredCharacters();
        
        if (filteredCharacters.length === 0) {
            targetContainer.innerHTML = `
                <div class="no-results" style="grid-column: 1 / -1;">
                    <i class="fas fa-search"></i>
                    <h3>Nenhum caractere encontrado</h3>
                    <p>Tente ajustar os filtros ou limpar todos os filtros</p>
                </div>
            `;
            return;
        }
        
        targetContainer.innerHTML = `
            <div class="character-list-grid">
                ${filteredCharacters.map(([unicode, data]) => `
                    <div class="character-list-item" data-unicode="${unicode}" data-category="${data.category}" data-tags="${data.tags.join(',')}" onclick="navigateToCharacter('${unicode}')">
                        <div class="character-list-display">${unicode}</div>
                        <div class="character-list-info">
                            <h3>${data.name}</h3>
                            <p>${unicode}</p>
                            <p style="color: var(--primary-color); font-size: 0.8rem;">${this.categories[data.category]?.name || data.category}</p>
                        </div>
                        <div class="character-list-description">${data.description}</div>
                        <div class="character-tags">
                            ${data.tags.map(tag => `
                                <span class="character-tag" style="--tag-color: ${this.tags[tag].color}">
                                    ${this.tags[tag].name}
                                </span>
                            `).join('')}
                        </div>
                        <div class="character-list-actions">
                            <button class="btn btn-sm btn-primary" onclick="copyCharacter('${unicode}', event)">
                                <i class="fas fa-copy"></i> Copiar
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="shareCharacter('${unicode}', '${unicode}', event)">
                                <i class="fas fa-share-alt"></i> Compartilhar
                            </button>
                            <button class="btn btn-sm favorite-btn" onclick="favoritesManager.addFavorite('${unicode}', '${unicode}', '${data.name}', event)">
                                <i class="far fa-heart"></i> Favoritar
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Atualizar botões de favorito
        if (typeof favoritesManager !== 'undefined') {
            favoritesManager.updateFavoriteButtons();
        }
    }

    setupSearchIntegration() {
        // Integrar com a busca existente
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            const originalValue = searchInput.value;
            searchInput.addEventListener('input', (e) => {
                this.performSearch(e.target.value);
            });
        }
    }

    setupSearchPageFilters() {
        // Para a página de busca, vamos adicionar filtros que funcionam com a busca existente
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) {
            // Adicionar evento para filtrar resultados existentes
            searchInput.addEventListener('input', (e) => {
                this.filterExistingResults(e.target.value);
            });
        }
    }

    filterExistingResults(query) {
        const characterItems = document.querySelectorAll('.character-list-item');
        const lowerQuery = query.toLowerCase();
        let visibleCount = 0;
        
        characterItems.forEach(item => {
            const name = item.querySelector('h3').textContent.toLowerCase();
            const unicode = item.querySelector('p').textContent.toLowerCase();
            const tags = item.dataset.tags?.toLowerCase() || '';
            
            // Aplicar filtros de categoria e tags
            const categoryMatch = this.activeFilters.category === 'all' || 
                               item.dataset.category === this.activeFilters.category;
            const tagsMatch = this.activeFilters.tags.length === 0 || 
                             (item.dataset.tags && this.activeFilters.tags.some(tag => item.dataset.tags.includes(tag)));
            
            const queryMatch = !query || name.includes(lowerQuery) || 
                              unicode.includes(lowerQuery) || 
                              tags.includes(lowerQuery);
            
            const shouldShow = categoryMatch && tagsMatch && queryMatch;
            item.style.display = shouldShow ? 'flex' : 'none';
            
            if (shouldShow) visibleCount++;
        });
        
        // Atualizar informações de resultados
        this.updateSearchResultsInfo(visibleCount, query);
    }

    updateSearchResultsInfo(count, query) {
        const subtitle = document.getElementById('searchSubtitle');
        if (subtitle) {
            if (query) {
                subtitle.textContent = `${count} resultados para "${query}"`;
            } else {
                subtitle.textContent = `Mostrando ${count} caracteres`;
            }
        }
    }

    performSearch(query) {
        const characterItems = document.querySelectorAll('.character-list-item');
        const lowerQuery = query.toLowerCase();
        
        characterItems.forEach(item => {
            const name = item.querySelector('h3').textContent.toLowerCase();
            const unicode = item.querySelector('p').textContent.toLowerCase();
            const tags = item.dataset.tags.toLowerCase();
            
            const matches = name.includes(lowerQuery) || 
                          unicode.includes(lowerQuery) || 
                          tags.includes(lowerQuery);
            
            item.style.display = matches ? 'flex' : 'none';
        });
        
        // Atualizar contagem de resultados
        const visibleItems = Array.from(characterItems).filter(item => item.style.display !== 'none');
        const filterCount = document.getElementById('filterCount');
        const resultsInfo = document.getElementById('resultsInfo');
        
        if (filterCount) {
            if (query) {
                filterCount.textContent = `${visibleItems.length} resultados para "${query}"`;
            } else {
                this.updateFilterSummary();
            }
        }
        
        if (resultsInfo) {
            if (query) {
                resultsInfo.textContent = `Encontrados ${visibleItems.length} caracteres para "${query}"`;
            } else {
                resultsInfo.textContent = '';
            }
        }
    }
}

// Sistema de Tema Automático
class ThemeManager {
    constructor() {
        this.theme = this.loadTheme();
        this.init();
    }

    init() {
        this.addThemeToggle();
        this.applyTheme();
        this.setupSystemPreferenceListener();
    }

    loadTheme() {
        const stored = localStorage.getItem('theme');
        if (stored) {
            return stored;
        }
        // Usar preferência do sistema se não houver salva
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    saveTheme(theme) {
        localStorage.setItem('theme', theme);
        this.theme = theme;
        this.applyTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        this.updateThemeToggle();
    }

    toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.saveTheme(newTheme);
        showToast(`Tema ${newTheme === 'dark' ? 'escuro' : 'claro'} ativado`, 'success');
    }

    addThemeToggle() {
        const navContainer = document.querySelector('.nav-container');
        if (!navContainer || document.getElementById('theme-toggle')) return;
        const themeToggle = document.createElement('button');
        themeToggle.id = 'theme-toggle';
        themeToggle.className = 'theme-toggle';
        themeToggle.onclick = () => this.toggleTheme();
        navContainer.appendChild(themeToggle);
    }

    updateThemeToggle() {
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.innerHTML = this.theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
    }

    setupSystemPreferenceListener() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addListener((e) => {
            // Só mudar automaticamente se o usuário não tiver definido manualmente
            if (!localStorage.getItem('theme')) {
                this.saveTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
}

// Inicializar sistemas
let favoritesManager;
let themeManager;
let categoryTagManager;

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar sistema de favoritos
    favoritesManager = new FavoritesManager();
    
    // Inicializar sistema de tema
    themeManager = new ThemeManager();
    
    // Inicializar sistema de categorias e tags nas páginas apropriadas
    if (window.location.pathname.includes('explore.html') || window.location.href.includes('explore.html') ||
        window.location.pathname.includes('search/index.html') || window.location.href.includes('search/index.html')) {
        categoryTagManager = new CategoryTagManager();
    }

    // Menu mobile toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');

    mobileMenu.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });

    // Smooth scrolling para links de navegação
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Animação ao fazer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, observerOptions);

    // Observar elementos para animação
    document.querySelectorAll('.character-card, .feature-card, .contact-card').forEach(el => {
        observer.observe(el);
    });

    // Tabs de informações técnicas
    document.querySelectorAll('.info-tabs').forEach(tabList => {
        const tabs = tabList.querySelectorAll('.info-tab');
        const panels = tabList.parentElement.querySelectorAll('.info-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.getAttribute('data-tab');
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                panels.forEach(panel => {
                    panel.classList.toggle('active', panel.getAttribute('data-panel') === target);
                });
            });
        });
    });
});

// Função para copiar caracteres
function copyCharacter(character, event) {
    if (event) {
        event.stopPropagation();
    }
    
    navigator.clipboard.writeText(character).then(function() {
        playSuccessSound();
        showToast('Caractere copiado com sucesso!', 'success');
    }).catch(function(err) {
        // Apenas tocar áudio de erro se realmente houver falha na cópia
        playErrorSound();
        showToast('Erro ao copiar caractere', 'error');
    });
}

// Função para copiar código Unicode
function copyUnicode(code, event) {
    if (event) {
        event.stopPropagation();
    }

    navigator.clipboard.writeText(code).then(function() {
        playSuccessSound();
        showToast('Código Unicode copiado!', 'success');
    }).catch(function() {
        // Apenas tocar áudio de erro se realmente houver falha na cópia
        playErrorSound();
        showToast('Erro ao copiar código', 'error');
    });
}

// Função para mostrar notificações toast
function showToast(message, type = 'success') {
    // Remover toast existente se houver
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Mostrar toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Esconder toast após 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Função para abrir página de detalhes do caractere
function openCharacter(unicodeCode) {
    const isInsideCharacterFolder = window.location.pathname.includes('/character/') || window.location.href.includes('/character/');

    if (unicodeCode.endsWith('.html')) {
        const basePath = isInsideCharacterFolder ? '' : 'character/';
        window.location.href = basePath + unicodeCode;
        return;
    }

    // Redirecionar para página de detalhes baseada no código Unicode
    const characterPages = {
        'U+007C': 'character/U+007C.html',
        'U+1160': 'character/U+1160.html',
        'U+2000': 'character/U+2000.html',
        'U+205F': 'character/U+205F.html',
        'U+0E18': 'character/U+0E18.html',
        'U+1FAEA': 'character/U+1FAEA.html'
    };
    
    const page = characterPages[unicodeCode];
    if (page) {
        const prefix = isInsideCharacterFolder ? '../' : '';
        window.location.href = prefix + page;
    } else {
        playErrorSound();
        showToast('Página do caractere não encontrada', 'error');
    }
}

// Função para abrir lista completa de caracteres
function openCharacterList() {
    window.location.href = './character/explore.html';
}

// Função para compartilhar caractere
function shareCharacter(character, unicodeCode) {
    const shareData = {
        title: `Character Hub - ${unicodeCode}`,
        text: `Confira este caractere especial: ${character}`,
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData)
            .then(() => showToast('Compartilhado com sucesso!', 'success'))
            .catch((error) => console.log('Erro ao compartilhar:', error));
    } else {
        // Fallback: copiar URL
        navigator.clipboard.writeText(window.location.href).then(() => {
            showToast('Link copiado para compartilhar!', 'success');
        });
    }
}

// Função para pesquisar caracteres
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    
    if (!searchTerm) {
        showToast('Digite algo para pesquisar', 'error');
        return;
    }

    window.location.href = `/search/?q=${encodeURIComponent(searchTerm)}`;
}


// Handle Enter key in search input
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
});

// Função para filtrar caracteres por categoria
function filterByCategory(category) {
    const cards = document.querySelectorAll('.character-card');
    
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
            card.classList.add('animate-fade-in');
        } else {
            card.style.display = 'none';
        }
    });
}

// Função para exportar lista de caracteres
function exportCharacters() {
    const characters = [];
    document.querySelectorAll('.character-card').forEach(card => {
        const char = card.querySelector('.character-display').textContent;
        const name = card.querySelector('h3').textContent;
        const code = card.querySelector('p').textContent;
        
        characters.push({
            character: char,
            name: name,
            unicode: code
        });
    });

    const dataStr = JSON.stringify(characters, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'characters.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('Lista de caracteres exportada!', 'success');
}

// Função para detectar suporte a caracteres
function checkCharacterSupport(character) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = '20px Arial';
    const metrics = ctx.measureText(character);
    
    // Se o caractere tiver largura 0 ou for muito pequeno, pode não ser suportado
    return metrics.width > 0;
}

// Função para gerar combinações de caracteres
function generateCombination(baseChar, diacriticChar, count = 10) {
    let combination = baseChar;
    for (let i = 0; i < count; i++) {
        combination += diacriticChar;
    }
    return combination;
}

// Função para validar entrada de caracteres
function validateCharacterInput(input) {
    // Remove caracteres que podem causar problemas
    return input.replace(/[\x00-\x1F\x7F]/g, '');
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar listeners para eventos de teclado
    document.addEventListener('keydown', function(e) {
        // ESC para fechar menu mobile
        if (e.key === 'Escape') {
            const navMenu = document.querySelector('.nav-menu');
            const mobileMenu = document.getElementById('mobile-menu');
            navMenu.classList.remove('active');
            mobileMenu.classList.remove('active');
        }
    });

    // Prevenir comportamento padrão em links externos com target="_blank"
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        link.addEventListener('click', function(e) {
            // Adicionar atributos de segurança
            this.setAttribute('rel', 'noopener noreferrer');
        });
    });

    // Lazy loading para imagens (se houver)
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
});

// Funções para análise de caracteres
function getCharacterInfo(character) {
    const codePoint = character.codePointAt(0);
    const unicode = 'U+' + codePoint.toString(16).toUpperCase().padStart(4, '0');
    
    return {
        character: character,
        codePoint: codePoint,
        unicode: unicode,
        name: getCharacterName(unicode),
        category: getCharacterCategory(character),
        script: getCharacterScript(character)
    };
}

function getCharacterName(unicode) {
    // Mapeamento básico de nomes de caracteres
    const names = {
        'U+007C': 'Vertical Line',
        'U+1160': 'Hangul Filler',
        'U+0E18': 'Thai Character Tho Thong',
        'U+0E34': 'Thai Character Sara I',
        'U+0E2C': 'Thai Character Thanthakhat'
    };
    
    return names[unicode] || 'Unknown Character';
}

function getCharacterCategory(character) {
    // Categorias Unicode básicas
    const categories = {
        '｜': 'Symbol, Math',
        'ㅤ': 'Other, Format',
        'ธ': 'Letter, Other',
        'ิ': 'Mark, Nonspacing',
        '์': 'Mark, Nonspacing'
    };
    
    return categories[character] || 'Unknown';
}

function getCharacterScript(character) {
    // Scripts Unicode
    const scripts = {
        '｜': 'Common',
        'ㅤ': 'Hangul',
        'ธ': 'Thai',
        'ิ': 'Thai',
        '์': 'Thai'
    };
    
    return scripts[character] || 'Unknown';
}

// Exportar funções para uso global
window.CharacterHub = {
    copyCharacter,
    copyUnicode,
    shareCharacter,
    filterByCategory,
    exportCharacters,
    getCharacterInfo,
    generateCombination,
    showToast
};
