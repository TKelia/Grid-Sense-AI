// Tutorial videos data
const tutorials = [
    {
        id: 1,
        title: 'Understanding Your Power Usage',
        description: 'Learn how to interpret your power consumption data and make informed decisions.',
        thumbnail: 'https://img.youtube.com/vi/example1/maxresdefault.jpg',
        duration: '5:30',
        category: 'basics'
    },
    {
        id: 2,
        title: 'Energy Saving Tips',
        description: 'Practical tips to reduce your daily power consumption and save money.',
        thumbnail: 'https://img.youtube.com/vi/example2/maxresdefault.jpg',
        duration: '4:45',
        category: 'tips'
    },
    {
        id: 3,
        title: 'Smart Device Management',
        description: 'How to manage and optimize your connected devices for better efficiency.',
        thumbnail: 'https://img.youtube.com/vi/example3/maxresdefault.jpg',
        duration: '6:15',
        category: 'devices'
    },
    {
        id: 4,
        title: 'Understanding AI Insights',
        description: 'Make the most of GridSenseAI\'s intelligent recommendations.',
        thumbnail: 'https://img.youtube.com/vi/example4/maxresdefault.jpg',
        duration: '7:00',
        category: 'ai'
    },
    {
        id: 5,
        title: "Home Energy Saving Tips",
        description: "Simple tips to reduce your home's energy consumption",
        thumbnail: "https://img.youtube.com/vi/9EMU_SztXs4/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/9EMU_SztXs4",
        category: "basics",
        duration: "4:23"
    },
    {
        id: 6,
        title: "Smart Appliance Energy Usage",
        description: "Learn how to optimize your appliances' energy consumption",
        thumbnail: "https://img.youtube.com/vi/N7yHZeJCD9c/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/N7yHZeJCD9c",
        category: "appliances",
        duration: "6:15"
    },
    {
        id: 7,
        title: "Advanced Home Energy Monitoring",
        description: "Set up a comprehensive home energy monitoring system",
        thumbnail: "https://img.youtube.com/vi/3V_VWHKZcDM/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/3V_VWHKZcDM",
        category: "advanced",
        duration: "8:42"
    },
    {
        id: 8,
        title: "Energy-Efficient Lighting Guide",
        description: "Choose and use energy-efficient lighting solutions",
        thumbnail: "https://img.youtube.com/vi/9EMU_SztXs4/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/9EMU_SztXs4",
        category: "basics",
        duration: "5:17"
    },
    {
        id: 9,
        title: "HVAC Energy Optimization",
        description: "Maximize your HVAC system's energy efficiency",
        thumbnail: "https://img.youtube.com/vi/N7yHZeJCD9c/maxresdefault.jpg",
        videoUrl: "https://www.youtube.com/embed/N7yHZeJCD9c",
        category: "appliances",
        duration: "7:30"
    }
];

class TutorialManager {
    constructor() {
        this.currentCategory = 'all';
        this.init();
    }

    init() {
        this.renderTutorials();
        this.setupFilters();
        this.setupSearch();
    }

    renderTutorials(filteredTutorials = tutorials) {
        const container = document.querySelector('.tutorials-grid');
        if (!container) return;

        container.innerHTML = filteredTutorials.map(tutorial => `
            <div class="tutorial-card" data-category="${tutorial.category}">
                <div class="tutorial-thumbnail">
                    <img src="${tutorial.thumbnail}" alt="${tutorial.title}">
                    <i class="fas fa-play-circle"></i>
                    <span class="duration">${tutorial.duration}</span>
                </div>
                <div class="tutorial-content">
                    <h3>${tutorial.title}</h3>
                    <p>${tutorial.description}</p>
                </div>
            </div>
        `).join('');

        // Add click handlers
        document.querySelectorAll('.tutorial-card').forEach(card => {
            card.addEventListener('click', () => this.playTutorial(card.dataset.id));
        });
    }

    setupFilters() {
        const filterContainer = document.querySelector('.tutorial-filters');
        if (!filterContainer) return;

        const categories = ['all', ...new Set(tutorials.map(t => t.category))];
        
        filterContainer.innerHTML = categories.map(category => `
            <button class="filter-btn ${category === 'all' ? 'active' : ''}" 
                    data-category="${category}">
                ${category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
        `).join('');

        filterContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                document.querySelectorAll('.filter-btn').forEach(btn => 
                    btn.classList.remove('active')
                );
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.category;
                this.filterTutorials();
            }
        });
    }

    setupSearch() {
        const searchInput = document.querySelector('.tutorial-search');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            this.filterTutorials(e.target.value);
        });
    }

    filterTutorials(searchTerm = '') {
        let filtered = tutorials;

        // Filter by category
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(tutorial => 
                tutorial.category === this.currentCategory
            );
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(tutorial =>
                tutorial.title.toLowerCase().includes(term) ||
                tutorial.description.toLowerCase().includes(term)
            );
        }

        this.renderTutorials(filtered);
    }

    playTutorial(id) {
        const tutorial = tutorials.find(t => t.id === parseInt(id));
        if (!tutorial) return;

        // Create modal for video player
        const modal = document.createElement('div');
        modal.className = 'tutorial-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="close-modal">&times;</button>
                <div class="video-container">
                    <!-- In production, replace with actual video embed -->
                    <div class="video-placeholder">
                        <i class="fas fa-play-circle"></i>
                        <p>Video player would be here in production</p>
                    </div>
                </div>
                <h3>${tutorial.title}</h3>
                <p>${tutorial.description}</p>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle close button
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => modal.remove());

        // Close on click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
}

class EnergyTutorialManager {
    constructor() {
        this.tutorials = [
            {
                id: 1,
                title: "Home Energy Saving Tips",
                description: "Simple tips to reduce your home's energy consumption",
                thumbnail: "https://img.youtube.com/vi/9EMU_SztXs4/maxresdefault.jpg",
                videoUrl: "https://www.youtube.com/embed/9EMU_SztXs4",
                category: "basics",
                duration: "4:23"
            },
            {
                id: 2,
                title: "Smart Appliance Energy Usage",
                description: "Learn how to optimize your appliances' energy consumption",
                thumbnail: "https://img.youtube.com/vi/N7yHZeJCD9c/maxresdefault.jpg",
                videoUrl: "https://www.youtube.com/embed/N7yHZeJCD9c",
                category: "appliances",
                duration: "6:15"
            },
            {
                id: 3,
                title: "Advanced Home Energy Monitoring",
                description: "Set up a comprehensive home energy monitoring system",
                thumbnail: "https://img.youtube.com/vi/3V_VWHKZcDM/maxresdefault.jpg",
                videoUrl: "https://www.youtube.com/embed/3V_VWHKZcDM",
                category: "advanced",
                duration: "8:42"
            },
            {
                id: 4,
                title: "Energy-Efficient Lighting Guide",
                description: "Choose and use energy-efficient lighting solutions",
                thumbnail: "https://img.youtube.com/vi/9EMU_SztXs4/maxresdefault.jpg",
                videoUrl: "https://www.youtube.com/embed/9EMU_SztXs4",
                category: "basics",
                duration: "5:17"
            },
            {
                id: 5,
                title: "HVAC Energy Optimization",
                description: "Maximize your HVAC system's energy efficiency",
                thumbnail: "https://img.youtube.com/vi/N7yHZeJCD9c/maxresdefault.jpg",
                videoUrl: "https://www.youtube.com/embed/N7yHZeJCD9c",
                category: "appliances",
                duration: "7:30"
            }
        ];

        this.init();
    }

    init() {
        this.setupFilterButtons();
        this.renderVideos('all');
    }

    setupFilterButtons() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.renderVideos(button.dataset.category);
            });
        });
    }

    renderVideos(category) {
        const videoList = document.getElementById('videoList');
        if (!videoList) return;

        const filteredVideos = category === 'all' 
            ? this.tutorials 
            : this.tutorials.filter(video => video.category === category);

        videoList.innerHTML = filteredVideos.map(video => `
            <div class="video-card" data-category="${video.category}">
                <div class="video-thumbnail" onclick="energyTutorialManager.playVideo('${video.videoUrl}', '${video.title}')">
                    <img src="${video.thumbnail}" alt="${video.title}">
                    <div class="play-overlay">
                        <i class="fas fa-play-circle"></i>
                        <span class="duration">${video.duration}</span>
                    </div>
                </div>
                <div class="video-info">
                    <h3>${video.title}</h3>
                    <p>${video.description}</p>
                    <span class="category-tag ${video.category}">
                        <i class="fas fa-tag"></i> ${video.category.charAt(0).toUpperCase() + video.category.slice(1)}
                    </span>
                </div>
            </div>
        `).join('');
    }

    playVideo(videoUrl, title) {
        // Create modal for video playback
        const modal = document.createElement('div');
        modal.className = 'video-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="video-container">
                    <iframe 
                        src="${videoUrl}?autoplay=1" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TutorialManager();
    window.energyTutorialManager = new EnergyTutorialManager();
});
