// src/components/Blog.js
import React, { useState } from 'react';

const Blog = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: 'Welcome to My Blog',
      content: 'This is the first post on my blog!',
      date: '2023-10-25',
    },
    // You can add more initial posts here
  ]);

  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
  });

  const handleInputChange = (e) => {
    setNewPost({
      ...newPost,
      [e.target.name]: e.target.value,
    });
  };

  const addPost = (e) => {
    e.preventDefault();
    if (newPost.title && newPost.content) {
      setPosts([
        {
          id: posts.length + 1,
          title: newPost.title,
          content: newPost.content,
          date: new Date().toISOString().split('T')[0],
        },
        ...posts,
      ]);
      setNewPost({ title: '', content: '' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Blog</h1>

      {/* New Post Form */}
      <form onSubmit={addPost} className="mb-8">
        <div className="mb-4">
          <label className="block text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={newPost.title}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Content</label>
          <textarea
            name="content"
            value={newPost.content}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md"
            rows="5"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Add Post
        </button>
      </form>

      {/* Posts List */}
      {posts.map((post) => (
        <div key={post.id} className="mb-8">
          <h2 className="text-2xl font-semibold">{post.title}</h2>
          <p className="text-gray-500 text-sm">{post.date}</p>
          <p className="mt-4">{post.content}</p>
        </div>
      ))}
    </div>
  );
};


export default Blog;