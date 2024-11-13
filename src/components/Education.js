import React from 'react';

const Education = () => {
  return (
    <section id="education" className="my-12">
      <h2 className="text-2xl font-bold text-blue-800 mb-4">Education</h2>
      <ul className="space-y-4">
        <li className="bg-white p-6 rounded-lg shadow-md">
          <p><strong>M.Sc. in Human-Centered AI</strong> - Karlsruhe Institute of Technology (KIT)</p>
          <p>2024 – Present</p>
          <ul className="list-disc list-inside ml-4 mt-2">
            <li>Focusing on Machine Learning, Cognitive Science, and Computer Vision</li>
            <li>Engaged in comprehensive studies covering Deep Learning for Computer Vision, Natural Language Processing, and Data Science</li>
            <li>Actively involved as a Research Assistant at KIT, applying theoretical AI knowledge to real-world problems</li>
          </ul>
        </li>
        <li className="bg-white p-6 rounded-lg shadow-md">
          <p><strong>B.Sc. in Industrial Engineering and Management</strong> - Karlsruhe Institute of Technology (KIT)</p>
          <p>2019 – 2023</p>
          <ul className="list-disc list-inside ml-4 mt-2">
            <li>Bachelor’s thesis (1.0) on “Generating Software Tests for Mobile Applications Using Transformer Networks” by training Large Language Models</li>
            <li>Seminar on Artificial Intelligence in Robotic Systems with a focus on practical AI applications</li>
            <li>Focus areas included Artificial Intelligence, Machine Learning, and Applied Computer Science</li>
          </ul>
        </li>
      </ul>
    </section>
  );
};

export default Education;