import Link from 'next/link';
import { ArrowRight, BookOpen, Laptop, Sofa, Shirt, ArrowRightLeft, Sparkles, Package } from 'lucide-react';
import ListingCard from '@/components/ListingCard';

async function getRecentListings() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/listings?limit=8`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching listings:', error);
    return [];
  }
}

const categories = [
  { name: 'Textbooks', slug: 'textbooks', icon: BookOpen, color: 'bg-blue-500', description: 'Course materials & study guides' },
  { name: 'Electronics', slug: 'electronics', icon: Laptop, color: 'bg-purple-500', description: 'Laptops, phones & gadgets' },
  { name: 'Furniture', slug: 'furniture', icon: Sofa, color: 'bg-green-500', description: 'Dorm & apartment essentials' },
  { name: 'Clothing', slug: 'clothing', icon: Shirt, color: 'bg-pink-500', description: 'Fashion & accessories' },
];

export default async function HomePage() {
  const listings = await getRecentListings();

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>The #1 Student Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Buy, Sell & Swap
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">
                Campus Essentials
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Save money on textbooks, find great deals on electronics, and connect with fellow students.
              Your campus marketplace for everything you need.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/listings"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-600 font-semibold rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                Browse Listings
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/listings/new"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 font-semibold rounded-full hover:bg-white/20 transition-all"
              >
                Start Selling
              </Link>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-600">Find exactly what you need for campus life</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/listings?category=${category.slug}`}
                className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-200 overflow-hidden"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 ${category.color} text-white rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                  <category.icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500">{category.description}</p>
                <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Swap Feature Highlight */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
                <ArrowRightLeft className="w-4 h-4" />
                New Feature
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Swap Items with Fellow Students
              </h2>
              <p className="text-gray-600 mb-6">
                Don&apos;t just buy and sell—trade! Mark your items as swappable and find students
                willing to exchange. Save money and give items a new life.
              </p>
              <Link
                href="/listings?swappable=true"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition"
              >
                Browse Swappable Items
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <ArrowRightLeft className="w-24 h-24 text-white" />
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-blue-400 rounded-full flex items-center justify-center shadow-lg">
                  <Laptop className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Recent Listings</h2>
              <p className="text-gray-600">Fresh items just added to the marketplace</p>
            </div>
            <Link
              href="/listings"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-indigo-600 font-medium hover:text-indigo-700 transition"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing._id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <div className="flex justify-center mb-4">
                <Package className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-600 mb-6">Be the first to post an item!</p>
              <Link
                href="/listings/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition"
              >
                Post Your First Item
              </Link>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 px-6 py-3 border border-indigo-600 text-indigo-600 font-medium rounded-full hover:bg-indigo-50 transition"
            >
              View All Listings
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
          <p className="text-gray-400 mb-8">
            List your items in minutes and reach thousands of students on campus.
            It&apos;s free, fast, and easy!
          </p>
          <Link
            href="/listings/new"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-all transform hover:scale-105"
          >
            Post an Item Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
