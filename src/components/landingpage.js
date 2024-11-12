// src/components/LandingPage.js
import React from 'react';
import { Menu } from 'lucide-react';
import './styles.css';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-900">Jacob Hoffmann</h1>
          <button
            className="md:hidden text-gray-500"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={24} />
          </button>
          <div className={`${isMenuOpen ? "block" : "hidden"} md:flex space-x-6`}>
            <a href="#about" className="text-gray-700 hover:text-blue-700">About Me</a>
            <a href="#publications" className="text-gray-700 hover:text-blue-700">Publications</a>
            <a href="#work-history" className="text-gray-700 hover:text-blue-700">Work History</a>
            <a href="#education" className="text-gray-700 hover:text-blue-700">Education</a>
            <a href="#languages" className="text-gray-700 hover:text-blue-700">Languages</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        
        {/* Name and Image Section */}
        <div className="flex flex-col md:flex-row items-start justify-between mb-12">
          {/* Name */}
          <div className="md:w-1/2 float-animation">
            <h1 className="text-left text-5xl md:text-7xl font-bold name-text">Jacob</h1>
            <h1 className="text-left text-5xl md:text-7xl font-bold name-text mt-2">Hoffmann</h1>
          </div>

          {/* Profile Image */}
          <div className="md:w-1/2 flex justify-center md:justify-end mt-8 md:mt-0 float-animation-slow">
            <div className="relative w-64 h-64 profile-image-container">
              <img
                src="/path/to/profile-image.jpg"  // Replace with your image path
                alt="Jacob Hoffmann"
                className="rounded-lg shadow-lg object-cover w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* About Section */}
        <section id="about" className="prose prose-lg max-w-none mb-12">
          <h2 className="text-3xl font-bold mb-4">About Me</h2>
          <p className="text-xl leading-relaxed about-text">
            I’m Jacob Hoffmann, a researcher and student specializing in Artificial Intelligence and Machine Learning, with a focus on Deep Learning for Computer Vision and Natural Language Processing.
          </p>
        </section>

        {/* Publications Section */}
        <section id="publications" className="prose prose-lg max-w-none mb-12">
          <h2 className="text-3xl font-bold mb-4">Publications</h2>
          <ul>
            <li>
              <p><strong>Generating Software Tests for Mobile Applications Using Fine-Tuned Large Language Models</strong></p>
              <p>Authors: Jacob Hoffmann, Demian Frister</p>
              <p>Presented at the 5th ACM/IEEE International Conference on Automation of Software Test (AST 2024)</p>
              <p><a href="https://doi.org/10.1145/3644032.3644454" className="text-blue-600 hover:underline">Read Publication</a></p>
            </li>
          </ul>
        </section>

        {/* Work History Section */}
        <section id="work-history" className="prose prose-lg max-w-none mb-12">
          <h2 className="text-3xl font-bold mb-4">Work History</h2>
          <ul>
            <li>
              <p><strong>Research Assistant</strong> - KIT (Oct 2023 – Present)</p>
              <p>Co-authored research on Large Language Models, applied reinforcement learning with human feedback.</p>
            </li>
            <li>
              <p><strong>Working Student</strong> - Naturana International (Jul 2021 – Jun 2022)</p>
              <p>Launched Naturana on Zalando, boosting online sales, managed e-commerce strategy for Shopify and Amazon.</p>
            </li>
            <li>
              <p><strong>Intern</strong> - OUTLETCITY AG (Oct 2020)</p>
              <p>Developed omnichannel shopping app, analyzed app data using Google Firebase, employed Scrum methodologies.</p>
            </li>
          </ul>
        </section>

        {/* Education Section */}
        <section id="education" className="prose prose-lg max-w-none mb-12">
          <h2 className="text-3xl font-bold mb-4">Education</h2>
          <ul>
            <li>
              <p><strong>M.Sc. in Information Systems</strong> - Karlsruhe Institute of Technology (2023 – Present)</p>
            </li>
            <li>
              <p><strong>B.Sc. in Industrial Engineering and Management</strong> - KIT (2019 – 2023 | Grade: 1.6)</p>
            </li>
            <li>
              <p><strong>General Qualification for University Entrance</strong> - Markgrafen Gymnasium (2011 – 2019 | Grade: 1.5)</p>
            </li>
          </ul>
        </section>

        {/* Languages Section */}
        <section id="languages" className="prose prose-lg max-w-none mb-12">
          <h2 className="text-3xl font-bold mb-4">Languages</h2>
          <ul>
            <li>German - Native</li>
            <li>English - C1 Level</li>
            <li>Latin - Latinum Certification</li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;