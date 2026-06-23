// Work.js
import React, { useState } from "react";
import Navbar from "./Navbar";
import ComputerGraphics from "./cg_project/ComputerGraphics";

const Work = () => {
  const [activeProject, setActiveProject] = useState(null);

  const projects = [
    {
      name: "Computer Graphics",
      description: "Interactive WebGL exercises — pipeline, models, texturing, lighting & shadows.",
      gradient: "from-slate-600 via-slate-800 to-slate-900",
      content: <ComputerGraphics />,
    },
    {
      name: "Arty App",
      description:
        "Showcases the Arty App with an interactive Figma prototype and a detailed PDF report.",
      previewImage: "/assets/images/Part 2.png",
      content: (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Arty App</h2>
          <p className="text-gray-700 mb-4">
            This project showcases the Arty App with an embedded Figma prototype.
          </p>
          <div className="overflow-hidden mb-8">
            <iframe
              title="Arty App Figma prototype"
              style={{ border: "1px solid rgba(0, 0, 0, 0.1)" }}
              width="800"
              height="450"
              src="https://embed.figma.com/proto/kUFD5i6dy9wtWRASm87Zvw/Art-Gallery-App-(wireframes)-Iteration-3?node-id=4311-1429&p=f&scaling=scale-down&content-scaling=fixed&page-id=4311%3A407&starting-point-node-id=4311%3A1916&embed-host=share"
              allowFullScreen
            ></iframe>
          </div>
          <div className="overflow-hidden">
            <h3 className="text-xl font-semibold mb-2">Arty App Report</h3>
            <iframe
              title="Arty App report"
              style={{ border: "1px solid rgba(0, 0, 0, 0.1)" }}
              width="800"
              height="600"
              src="/assets/Group_71_Final_Assignment.pdf"
            ></iframe>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-16 relative z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-center">
          My Work
        </h1>
        {/* 1×N layout: one column for project previews */}
        <div className="grid grid-cols-1 gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer transform transition hover:scale-105"
              onClick={() => setActiveProject(index)}
            >
              {/* Preview container with fixed dimensions */}
              <div className="relative w-[400px] h-[200px] mx-auto">
                {project.previewImage ? (
                  <img
                    src={project.previewImage}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full bg-gradient-to-br ${
                      project.gradient || "from-gray-600 to-gray-900"
                    }`}
                  />
                )}
                {/* Overlay with title and subtext in lower left */}
                <div className="absolute inset-0 flex flex-col justify-end items-start p-4 bg-gradient-to-t from-black via-transparent to-transparent">
                  <h2 className="text-xl font-semibold text-white">
                    {project.name}
                  </h2>
                  <p className="text-sm text-gray-300">{project.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full-screen overlay for project details */}
      {activeProject !== null && (
        <div
          className="fixed inset-0 bg-white z-50 overflow-y-auto"
          onClick={() => setActiveProject(null)}
        >
          {/* Close button (stays fixed in the corner) */}
          <button
            className="fixed top-4 right-4 z-10 text-gray-600 hover:text-gray-900 bg-white/80 rounded-full p-1"
            onClick={() => setActiveProject(null)}
            aria-label="Close project"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          {/* Project content — stop clicks here from closing the overlay */}
          <div className="p-6 sm:p-10" onClick={(e) => e.stopPropagation()}>
            <div className="max-w-6xl mx-auto">
              {projects[activeProject].content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Work;
