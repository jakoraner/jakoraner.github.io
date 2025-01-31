// LandingPage.js
import React, { useEffect, useRef } from 'react';
import Navbar from './Navbar';
import './styles.css';

// Import the background image and profile image
import backgroundImage from '../assets/images/IMG_6674.jpg';
import profileImage from '../assets/images/IMG_1671-3.jpg';
import backgroundImage3 from '../assets/images/20240921_TQD001.jpeg';

const LandingPage = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const image = imageRef.current;
      if (image) {
        const imagePosition = image.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (imagePosition < windowHeight - 100) { // Trigger earlier for smoother animation
          image.classList.add('bounce');
        } else {
          image.classList.remove('bounce');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      // Cleanup
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen font-sans text-gray-800">
      <Navbar />

      {/* Hero Section with Background Image */}
      <div
        className="relative bg-cover bg-bottom sm:bg-scroll md:bg-fixed"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          height: '60vh',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white text-center px-4">
            Reloading...
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="bg-white">
        {/* About Section */}
        <section id="about" className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row md:items-start md:space-x-8">
            {/* About Me Text */}
            <div className="md:w-2/3">
              <h2 className="section-title mb-4 text-3xl sm:text-4xl font-semibold">
                About Me
              </h2>
              <p className="text-lg sm:text-xl leading-relaxed text-gray-600 text-left">
                I'm Jacob, a researcher and student specializing in artificial intelligence and
                machine learning, with a focus on the training of large language models. I am
                currently pursuing a master's degree in Human-Centered AI at the Technical University
                of Denmark.
              </p>
            </div>

            {/* Profile Image */}
            <div className="w-full md:w-1/3 mt-8 md:mt-0 flex justify-center md:justify-end">
              <img
                src={profileImage}
                alt="Jacob Hoffmann"
                className="w-full sm:w-56 md:w-64 lg:w-72 h-auto object-cover shadow-lg rounded-md"
                id="profile-image"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full border-t border-gray-200"></div>

        {/* Publications Section */}
        <section
          id="publications"
          className="relative bg-center bg-cover py-16 sm:bg-scroll md:bg-fixed"
          style={{
            backgroundImage: `url(${backgroundImage3})`,
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="relative max-w-6xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-8 text-center">
              Publications
            </h2>
            <ul className="text-gray-800 space-y-8">
              <li className="bg-white shadow-md rounded-md p-6">
                <h3 className="text-xl sm:text-2xl font-semibold mb-2">
                  Generating Software Tests for Mobile Applications Using Fine-Tuned Large Language Models
                </h3>
                <p className="mb-2">
                  <strong>Authors:</strong> Jacob Hoffmann, Demian Frister
                </p>
                <p className="mb-2">
                  Presented at the 5th ACM/IEEE International Conference on Automation of Software Test (AST 2024)
                </p>
                <a
                  href="https://doi.org/10.1145/3644032.3644454"
                  className="text-blue-500 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read Publication
                </a>
              </li>
              {/* Add more publications as needed */}
            </ul>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full border-t border-gray-200"></div>

        {/* Work History Section */}
        <section id="work-history" className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-8 text-left">
            Experience
          </h2>
          <div className="space-y-8">
            {/* Job 1 */}
            <div className="bg-white shadow-md rounded-md p-6">
              <h3 className="text-xl sm:text-2xl font-semibold mb-2">Research Assistant</h3>
              <p className="mb-2 italic text-gray-700">
                Karlsruhe Institute of Technology (KIT), Institute AIFB (Oct 2023 – Present)
              </p>
              <ul className="list-disc list-outside pl-5 space-y-2 text-gray-600 leading-relaxed">
                <li>
                  Co-authored and presented the paper “Generating Software Tests for Mobile Applications Using Fine-Tuned Large Language Models” as a Poster Abstract at ACM/IEEE’s AST 2024 in Lisbon
                </li>
                <li>
                  Independently led a project focused on creating synthetic datasets, utilizing large language models for data filtering and enhancement, contributing to improved fine-tuning techniques
                </li>
                <li>
                  Played a key role in the development and optimization of the research group’s in-house LLM API
                </li>
                <li>
                  Authored an upcoming article for SIGS Datacom’s German Testing Magazine
                </li>
              </ul>
            </div>

            {/* Job 2 */}
            <div className="bg-white shadow-md rounded-md p-6">
              <h3 className="text-xl sm:text-2xl font-semibold mb-2">Working Student</h3>
              <p className="mb-2 italic text-gray-700">
                Naturana International, Stuttgart, Germany (Jul 2021 – Jun 2022)
              </p>
              <ul className="list-disc list-outside pl-5 space-y-2 text-gray-600 leading-relaxed">
                <li>
                  Led the technical launch of the Naturana brand on Zalando
                </li>
                <li>
                  Boosted online sales, achieving 25% of total online sales on Zalando through data-driven strategies
                </li>
                <li>
                  Managed e-commerce strategies on the Shopify and Amazon platforms, implementing data analytics for performance tracking
                </li>
              </ul>
            </div>

            {/* Job 3 */}
            <div className="bg-white shadow-md rounded-md p-6">
              <h3 className="text-xl sm:text-2xl font-semibold mb-2">Intern</h3>
              <p className="mb-2 italic text-gray-700">
                OUTLETCITY AG, Metzingen, Germany (Oct 2020)
              </p>
              <ul className="list-disc list-outside pl-5 space-y-2 text-gray-600 leading-relaxed">
                <li>
                  Developed Outletcity Metzingen's omnichannel shopping app using Kotlin, enhancing the customer retail experience
                </li>
                <li>
                  Conducted user data analysis via Google Firebase and worked on product management tasks in an agile setting using Scrum and Jira
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full border-t border-gray-200"></div>

        {/* Education Section */}
        <section
          id="education"
          className="relative bg-center bg-cover py-16 sm:bg-scroll md:bg-fixed"
          style={{
            backgroundImage: `url(${backgroundImage3})`, // Replace with the actual background image
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="relative max-w-6xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-8 text-center">
              Education
            </h2>
            <ul className="text-gray-800 space-y-8">
              <li className="bg-white shadow-md rounded-md p-6">
                <h3 className="text-xl sm:text-2xl font-semibold mb-2">M.Sc. in Human-Centered AI</h3>
                <p className="mb-2 italic text-gray-700">
                  Technical University of Denmark (DTU) (2024 – Present)
                </p>
                <ul className="list-disc list-outside pl-5 space-y-2 text-gray-600 leading-relaxed">
                  <li>Focusing on Machine Learning, Cognitive Science, and Computer Vision</li>
                  <li>Comprehensive studies in Deep Learning, NLP, and Data Science</li>
                  <li>Research Assistant at KIT, applying theoretical AI knowledge to real-world problems</li>
                </ul>
              </li>

              <li className="bg-white shadow-md rounded-md p-6">
                <h3 className="text-xl sm:text-2xl font-semibold mb-2">
                  B.Sc. in Industrial Engineering and Management
                </h3>
                <p className="mb-2 italic text-gray-700">
                  Karlsruhe Institute of Technology (KIT) (2019 – 2023)
                </p>
                <ul className="list-disc list-outside pl-5 space-y-2 text-gray-600 leading-relaxed">
                  <li>
                    Bachelor’s thesis on “Generating Software Tests for Mobile Applications Using Transformer Networks”
                  </li>
                  <li>Seminar on AI in Robotic Systems, focusing on practical applications</li>
                  <li>Specialization in AI, Machine Learning, and Applied Computer Science</li>
                </ul>
              </li>
            </ul>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full border-t border-gray-200"></div>

        {/* Languages Section */}
        <section id="languages" className="max-w-6xl mx-auto px-4 py-16 bg-gray-50">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-8 text-left">
            Languages
          </h2>
          <div className="bg-white shadow-md rounded-md p-6">
            <ul className="text-gray-800 text-lg sm:text-xl space-y-4">
              <li>German - Native</li>
              <li>English - C1 Level</li>
              <li>Danish - A1 Level</li>
              <li>Latin - Latinum Certification</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;