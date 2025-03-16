'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, PenTool } from 'lucide-react';
import Navbar from "./navbar";

export default function Home() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogTopic: topic }),
      });
      if (!response.ok) {
        console.warn('Error status:', response.status);
        const errorText = await response.text();
        console.warn('Error body:', errorText);
        throw new Error('Failed to generate the blog content');
      }
      const data = await response.json();
      const blogId = data.blogId;
      router.push(`/blog/${blogId}`);
    } catch (error) {
      setError('Error generating the blog content. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all hover:shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-100 rounded-full p-3">
              <PenTool className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-center text-indigo-600 mb-6">
            BucketByte
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Enter a topic to generate a captivating blog in markdown format
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                onChange={handleInputChange}
                value={topic}
                placeholder="Enter a topic..."
                className="w-full p-4 pr-12 border-2 text-gray-800 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                required
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-indigo-400">
                💡
              </span>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Generating...
                </>
              ) : (
                'Generate Blog'
              )}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
      <Navbar />
    </div>
  );
}