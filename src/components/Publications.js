import React from 'react';

const Publications = () => {
  return (
    <section id="publications" className="my-12">
      <h2 className="text-2xl font-bold text-blue-800 mb-4">Publications</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="font-semibold">Generating Software Tests for Mobile Applications Using Fine-Tuned Large Language Models</p>
        <p>Authors: Jacob Hoffmann, Demian Frister</p>
        <p>Presented at the 5th ACM/IEEE International Conference on Automation of Software Test (AST 2024)</p>
        <p>Published in <em>AST '24 Proceedings</em>, Pages 76-77, June 10, 2024</p>
        <a href="https://doi.org/10.1145/3644032.3644454" target="_blank" rel="noopener noreferrer" className="text-teal-500 hover:underline">
          Read Publication
        </a>
        <p>Total Citations: <strong>1</strong> (from <a href="https://scholar.google.com/citations?user=fEXMoLIAAAAJ&hl=en" target="_blank" rel="noopener noreferrer" className="text-teal-500 hover:underline">Google Scholar</a>)</p>
      </div>
    </section>
  );
};

export default Publications;