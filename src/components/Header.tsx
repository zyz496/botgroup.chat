import React, { useEffect } from 'react';
import GitHubButton from 'react-github-btn';

const Header: React.FC = () => {
  useEffect(() => {
    const fetchGitHubStars = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/maojindao55/botgroup.chat');
        const data = await response.json();
        const starsElement = document.getElementById('github-stars');
        if (starsElement) {
          starsElement.textContent = data.stargazers_count.toLocaleString();
        }
      } catch (error) {
        console.error('Failed to fetch GitHub stars:', error);
      }
    };

    fetchGitHubStars();
  }, []);

  return (
    <header className="bg-transparent fixed top-0 left-0 right-0 z-50 hidden md:block">
      <div className="w-full px-2 h-10 flex items-center">
        {/* Logo */}
        <div className="flex-1 flex items-center">
          <a href="/" className="text-sm font-medium text-gray-700 hover:text-gray-500">
            botgroup.chat
          </a>
        </div>

        {/* GitHub Star Button */}
        <div className="flex items-center justify-end">
          <GitHubButton 
            href="https://github.com/maojindao55/botgroup.chat"
            data-color-scheme="no-preference: light; light: light; dark: dark;"
            data-size="large"
            data-show-count="true"
            aria-label="Star maojindao55/botgroup.chat on GitHub"
          >
            Star
          </GitHubButton>
        </div>
      </div>
    </header>
  );
};

export default Header; 