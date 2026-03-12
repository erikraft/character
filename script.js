// Funções utilitárias
document.addEventListener('DOMContentLoaded', function() {
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

    // Tabs de informa????es t??cnicas
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
        showToast('Caractere copiado com sucesso!', 'success');
    }).catch(function(err) {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = character;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            showToast('Caractere copiado com sucesso!', 'success');
        } catch (err) {
            showToast('Erro ao copiar caractere', 'error');
        }
        
        document.body.removeChild(textArea);
    });
}

// Função para copiar código Unicode
function copyUnicode(code, event) {
    if (event) {
        event.stopPropagation();
    }

    navigator.clipboard.writeText(code).then(function() {
        showToast('Código Unicode copiado!', 'success');
    }).catch(function() {
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            showToast('Código Unicode copiado!', 'success');
        } catch (err) {
            showToast('Erro ao copiar código', 'error');
        }

        document.body.removeChild(textArea);
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
    // Redirecionar para página de detalhes baseada no código Unicode
    const characterPages = {
        'U+007C': 'character/U+007C.html',
        'U+1160': 'character/U+1160.html',
        'U+2000': 'character/U+2000.html',
        'U+205F': 'character/U+205F.html',
        'U+0E18': 'character/U+0E18.html'
    };
    
    const page = characterPages[unicodeCode];
    if (page) {
        window.location.href = page;
    } else {
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
    searchCharacters,
    filterByCategory,
    exportCharacters,
    getCharacterInfo,
    generateCombination,
    showToast
};
