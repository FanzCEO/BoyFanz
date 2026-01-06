/**
 * Documentation Page
 * Displays platform documentation and tutorials
 */

import { useState } from 'react';
import { Link } from 'wouter';

export default function Docs() {
  const [activeTab, setActiveTab] = useState<'getting-started' | 'creators' | 'fans'>('getting-started');

  return (
    <div className="min-h-screen bg-boy-bg-primary p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Documentation & Help</h1>
        
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('getting-started')}
            className={`px-6 py-3 rounded-lg ${activeTab === 'getting-started' ? 'bg-boy-accent text-white' : 'bg-boy-bg-secondary'}`}
          >
            Getting Started
          </button>
          <button 
            onClick={() => setActiveTab('creators')}
            className={`px-6 py-3 rounded-lg ${activeTab === 'creators' ? 'bg-boy-accent text-white' : 'bg-boy-bg-secondary'}`}
          >
            Creator Guides
          </button>
          <button 
            onClick={() => setActiveTab('fans')}
            className={`px-6 py-3 rounded-lg ${activeTab === 'fans' ? 'bg-boy-accent text-white' : 'bg-boy-bg-secondary'}`}
          >
            Fan Guides
          </button>
        </div>

        <div className="bg-boy-bg-secondary rounded-lg p-8">
          {activeTab === 'getting-started' && (
            <div className="prose max-w-none">
              <h2>Getting Started</h2>
              <p>Welcome to the platform! Here's how to get started:</p>
              <ul>
                <li>Create your account with email verification</li>
                <li>Set up your profile with photo and bio</li>
                <li>Explore content from creators</li>
                <li>Subscribe to your favorite creators</li>
              </ul>
              <Link to="/docs/tutorials/fan" className="text-boy-accent">View full fan tutorial →</Link>
            </div>
          )}
          
          {activeTab === 'creators' && (
            <div className="prose max-w-none">
              <h2>Creator Resources</h2>
              <h3>Monetization</h3>
              <ul>
                <li>Set subscription pricing ($4.99-$49.99/month)</li>
                <li>Earn 80% revenue share</li>
                <li>Weekly payouts (minimum $50)</li>
                <li>Multiple revenue streams: subscriptions, tips, PPV, live streams</li>
              </ul>
              <h3>Content Strategy</h3>
              <ul>
                <li>Post daily for best results</li>
                <li>Mix free teasers (60%), subscriber content (30%), PPV (10%)</li>
                <li>Engage with all comments within 24 hours</li>
                <li>Use live streams to boost revenue</li>
              </ul>
              <Link to="/docs/tutorials/creator" className="text-boy-accent">View full creator tutorial →</Link>
            </div>
          )}
          
          {activeTab === 'fans' && (
            <div className="prose max-w-none">
              <h2>Fan Guide</h2>
              <h3>How to Subscribe</h3>
              <ol>
                <li>Browse creators on the Discover page</li>
                <li>Click Subscribe on creator profile</li>
                <li>Choose subscription length (1, 3, 6, or 12 months)</li>
                <li>Complete payment</li>
                <li>Access exclusive content immediately</li>
              </ol>
              <h3>Interacting with Content</h3>
              <ul>
                <li>Like posts to show support</li>
                <li>Comment to engage with creators</li>
                <li>Send tips to show extra appreciation</li>
                <li>Join live streams for real-time interaction</li>
              </ul>
              <Link to="/docs/tutorials/fan" className="text-boy-accent">View full fan tutorial →</Link>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-boy-bg-secondary p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Need Help?</h3>
            <p className="mb-4">Contact our support team</p>
            <a href="mailto:support@fanz.website" className="text-boy-accent">support@fanz.website</a>
          </div>
          
          <div className="bg-boy-bg-secondary p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Creator Support</h3>
            <p className="mb-4">Questions about monetization?</p>
            <a href="mailto:creators@fanz.website" className="text-boy-accent">creators@fanz.website</a>
          </div>
          
          <div className="bg-boy-bg-secondary p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Report a Bug</h3>
            <p className="mb-4">Found an issue?</p>
            <a href="mailto:bugs@fanz.website" className="text-boy-accent">bugs@fanz.website</a>
          </div>
        </div>
      </div>
    </div>
  );
}
