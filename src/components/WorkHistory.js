import React from 'react';

const WorkHistory = () => {
  return (
    <section id="work" className="my-12">
      <h2 className="text-2xl font-bold text-blue-800 mb-4">Work History</h2>
      <ul className="space-y-4">
        <li className="bg-white p-6 rounded-lg shadow-md">
          <p><strong>Research Assistant</strong> - KIT</p>
          <p>Oct 2023 – Present</p>
          <p>Co-authored research on Large Language Models, applied reinforcement learning with human feedback.</p>
        </li>
        <li className="bg-white p-6 rounded-lg shadow-md">
          <p><strong>Working Student</strong> - Naturana International</p>
          <p>Jul 2021 – Jun 2022</p>
          <p>Launched Naturana on Zalando, boosting online sales, managed e-commerce strategy for Shopify and Amazon.</p>
        </li>
      </ul>
    </section>
  );
};

export default WorkHistory;