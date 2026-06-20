import { useState } from 'react';
import './Blog.css';

/* 
  Welcome! If youre reading this, you a real one. I hope you find these articles intriguing and thought provoking.
  
  There are many tragedies going on the world and we all need a place for love and acceptance.
  This is why I made Eden Blog.
*/


/*BLOG_POSTS array w/ scaffold of blog post objects.
I'm currently importing my posts, just getting it all setup still.
 */
const BLOG_POSTS = [
  {
    id: 1,
    title: 'Getting Started with Native Plants',
    excerpt: 'Learn why native plants are important for your garden ecosystem.',
    date: 'June 15, 2026',
    content: 'Native plants are specially adapted to thrive in local climates and soil conditions. They require less maintenance, water, and fertilizer compared to non-native species. By planting native species, you support local wildlife including pollinators like bees and butterflies.'
  },
  {
    id: 2,
    title: 'Best Pollinators for Your Garden',
    excerpt: 'Discover which pollinators will thrive in your garden and how to attract them.',
    date: 'June 10, 2026',
    content: 'Pollinators are essential for plant reproduction and food production. The most common pollinators include honeybees, bumblebees, butterflies, and moths. To attract them, plant flowers that bloom at different times throughout the season and avoid pesticides.'
  },
  {
    id: 3,
    title: 'Seasonal Gardening Tips',
    excerpt: 'A guide to planting and maintaining your garden throughout all seasons.',
    date: 'June 5, 2026',
    content: 'Each season offers unique opportunities for gardeners. Spring is ideal for planting perennials, summer requires more watering and pest management, fall is perfect for planting bulbs, and winter is the time to plan next year\'s garden.'
  },
  {
    id: 4,
    title: 'Understanding Soil Types',
    excerpt: 'Learn how to identify and work with different soil types in your garden.',
    date: 'May 28, 2026',
    content: 'Soil is the foundation of a healthy garden. The three main types are sandy, clay, and loamy soil. Each has different properties affecting drainage and nutrient retention. Testing your soil can help you choose the right plants and amendments.'
  }
];

function Blog({ onBack }) {
  const [selectedPost, setSelectedPost] = useState(null);

  return (
    <div className="blog-layout">
      <header className="blog-header">
        <div className="blog-header-inner">
          <div className="blog-header-brand">
            <button
              className="back-button"
              onClick={onBack}
              aria-label="Back to landing page"
            >
              ← Back
            </button>
            <span className="blog-title">Eden Blog</span>
          </div>
        </div>
      </header>

      <div className="blog-body">
        {selectedPost ? (
          <article className="blog-post-detail">
            <button
              className="back-to-list"
              onClick={() => setSelectedPost(null)}
            >
              ← Back to Articles
            </button>
            <h1>{selectedPost.title}</h1>
            <p className="post-meta">{selectedPost.date}</p>
            <p className="post-content">{selectedPost.content}</p>
          </article>
        ) : (
          <div className="blog-posts-grid">
            <h1 className="blog-heading">Latest Articles</h1>
            <div className="posts-list">
              {BLOG_POSTS.map(post => (
                <article
                  key={post.id}
                  className="blog-post-card"
                  onClick={() => setSelectedPost(post)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedPost(post);
                    }
                  }}
                >
                  <h2>{post.title}</h2>
                  <p className="post-meta">{post.date}</p>
                  <p className="post-excerpt">{post.excerpt}</p>
                  <span className="read-more">Read More →</span>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="blog-footer">
        <i className ='popout'><a href='https://en.wikipedia.org/wiki/Pettson_and_Findus' target='_blank' rel='noopener noreferrer'>Background image Credit: Pettson & Findus</a></i>
      </div>
    </div>
  );
}

export default Blog;
