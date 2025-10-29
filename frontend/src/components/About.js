import React from 'react';
import { Video, Users, Shield, Zap, Heart, MessageCircle } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Video size={32} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About VideoChat
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with people around the world through instant video conversations.
            Experience seamless, secure, and fun video chatting like never before.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Community</h3>
            <p className="text-gray-600">
              Connect with people from every corner of the globe. Break down barriers and make friends worldwide.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg text-center border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
            <p className="text-gray-600">
              Your conversations are protected with end-to-end encryption. Your privacy is our top priority.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg text-center border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-gray-600">
              Experience crystal-clear video and audio with minimal latency. Connect instantly, no waiting.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg text-center border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Heart size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Made with Love</h3>
            <p className="text-gray-600">
              Built by passionate developers who believe in connecting people and fostering meaningful relationships.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg text-center border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Real Conversations</h3>
            <p className="text-gray-600">
              More than just video calls - engage in genuine conversations that matter. Share experiences and create memories.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg text-center border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Video size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">HD Quality</h3>
            <p className="text-gray-600">
              Enjoy high-definition video calls with adaptive quality that adjusts to your connection for the best experience.
            </p>
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-3xl p-8 mb-16 shadow-lg border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Mission</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-gray-700 mb-4">
                At VideoChat, we believe that genuine human connection transcends geographical boundaries.
                Our mission is to create a safe, inclusive platform where people can meet, share ideas,
                and build meaningful relationships through video conversations.
              </p>
              <p className="text-gray-700 mb-4">
                Whether you're looking to make new friends, practice a language, or simply have a
                conversation with someone new, VideoChat provides the perfect environment for authentic
                interactions.
              </p>
              <p className="text-gray-700">
                We're committed to maintaining the highest standards of privacy, security, and user
                experience to ensure every conversation is enjoyable and safe.
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
                <Heart size={48} className="text-white" />
              </div>
              <p className="text-gray-500 italic">
                "Connecting hearts, one video call at a time"
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Connect?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of users already connecting through VideoChat.
            Start your journey of global friendship today.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Start Chatting Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;
