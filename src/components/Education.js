import React from 'react';

const Education = () => {
  return (
    <section id="education" className="my-12">
      <h2 className="text-2xl font-bold text-blue-800 mb-4">Education</h2>
      <ul className="space-y-4">
        <li className="bg-white p-6 rounded-lg shadow-md">
          <p><strong>M.Sc. in Information Systems</strong> - Karlsruhe Institute of Technology (KIT)</p>
          <p>2023 – Present</p>
        </li>
        <li className="bg-white p-6 rounded-lg shadow-md">
          <p><strong>B.Sc. in Industrial Engineering and Management</strong> - KIT</p>
          <p>2019 – 2023 | Grade: 1.6</p>
        </li>
      </ul>
    </section>
  );
};

export default Education;