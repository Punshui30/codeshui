'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ContainerScroll } from './container-scroll-animation';

export function HeroSection() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-white">
      {/* Main Scroll Animation Landing Experience */}
      <ContainerScroll 
        titleComponent={ 
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
              <span className="text-white font-bold text-3xl">CS</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-zinc-900 mb-6 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                CodeShui
              </span>
            </h1>
            
            <p className="text-xl text-zinc-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              Your AI-powered code builder with a modern, beautiful interface. 
              Create, edit, and deploy with intelligent assistance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
                Get Started
              </button>
              <button className="px-8 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium rounded-lg transition-colors duration-200 border border-zinc-200">
                Learn More
              </button>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm border border-zinc-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">AI-Powered</h3>
                <p className="text-sm text-zinc-600">Intelligent code assistance and debugging</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-zinc-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">Full-Stack</h3>
                <p className="text-sm text-zinc-600">Frontend to backend development</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-zinc-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">Real-time</h3>
                <p className="text-sm text-zinc-600">Instant preview and live updates</p>
              </div>
            </div>
          </motion.div>
        }
      >
        {/* This is where the tablet content will go - showing the app interface */}
        <div className="w-full h-full bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-2xl p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">
              CodeShui Interface
            </h2>
            <p className="text-zinc-600 mb-6">
              Your live preview will appear here when you open files and start coding.
            </p>
            
            {/* Mock interface elements */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-zinc-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-sm text-zinc-500 font-mono">
                  // Your code will appear here
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-zinc-200">
                <div className="text-sm text-zinc-500 font-mono">
                  // AI Assistant ready to help
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContainerScroll>
    </div>
  );
}
