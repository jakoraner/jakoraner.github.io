// Work.js
import React, { useState } from "react";
import Navbar from "./Navbar";
import W01P1 from "./cg_project/01/w01p1";
import W01P2 from "./cg_project/01/w01p2";
import W01P3 from "./cg_project/01/w01p3";
import W01P4 from "./cg_project/01/w01p4";
import W01P5 from "./cg_project/01/w01p5";

const Work = () => {
  const [activeProject, setActiveProject] = useState(null);

  const projects = [
    {
      name: "Computer Graphics",
      description:
        "This project explores fundamental concepts in computer graphics using WebGL.",
      previewImage: "/assets/images/placeholder.png", // Update with your actual preview image
      content: (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Worksheet 01</h2>
          <p className="text-gray-700 mb-4">
            This project explores fundamental concepts in computer graphics using WebGL.
            It covers topics such as setting up a WebGL context, loading and compiling shaders,
            handling vertex buffers, and animating simple shapes.
          </p>
          {/* First Exercise: Basic WebGL Setup */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2">
              Exercise 1: Basic WebGL Setup
            </h3>
            <p className="text-gray-700 mb-2">
              This exercise demonstrates setting up a basic WebGL context and clearing the canvas
              with a specific color (cornflower blue).
            </p>
            <W01P1 />
            <p className="text-gray-700 mt-2">
              <strong>Code Explanation:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700">
              <li>We obtain the canvas element and initialize the WebGL context.</li>
              <li>The viewport is configured to match the canvas dimensions.</li>
              <li>
                The <code>gl.clearColor</code> function sets the background color.
              </li>
              <li>
                <code>gl.clear(gl.COLOR_BUFFER_BIT)</code> clears the canvas with the specified color.
              </li>
            </ul>
          </div>
          {/* Additional exercises omitted for brevity */}
        </div>
      ),
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
              style={{ border: "1px solid rgba(0, 0, 0, 0.1)" }}
              width="800"
              height="600"
              src="/assets/Group_71_Final_Assignment.pdf"
            ></iframe>
          </div>
        </div>
      ),
    },
    {
      name: "Placeholder Project",
      description: "More project content will go here.",
      previewImage: "/assets/images/placeholder.png",
      content: <div>More project content will go here.</div>,
    },
    // Add more projects here in the future
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
                {project.previewImage && (
                  <img
                    src={project.previewImage}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                )}
                {/* Overlay with title and subtext in lower left */}
                <div className="absolute inset-0 flex flex-col justify-end items-start p-4 bg-gradient-to-t from-black via-transparent to-transparent">
                  <h2 className="text-xl font-semibold text-white">
                    {project.name}
                  </h2>
                  <p className="text-sm text-gray-300">
                    {project.description}
                  </p>
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
          <div className="p-10">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
              onClick={() => setActiveProject(null)}
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
            {/* Project content */}
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